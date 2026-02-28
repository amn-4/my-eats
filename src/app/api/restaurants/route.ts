// src\app\api\restaurants\route.ts

import { db } from "../../../../lib/drizzle";
import { restaurants, restaurantDietaryReqs, restaurantTags, suburbs, cuisines, dietaryReqs, tags } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";
import { eq, and, ilike, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// ----------------------
// POST /api/restaurants
// ----------------------
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // checks if data is correct before saving to db
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    let suburbId = body.suburbId;
    let cuisineId = body.cuisineId;

    // handle suburb (checks if it's uuid or name)
    if (suburbId) {
      // if it doesn't look like uuid, treat it as a name
      if (!suburbId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const trimmedName = suburbId.trim();

        // check if suburb exists
        const existingSuburb = await db
          .select()
          .from(suburbs)
          .where(ilike(suburbs.name, suburbId)) // use ilike for case-insensitive matching
          .limit(1);
        
        if (existingSuburb.length > 0) {
          suburbId = existingSuburb[0].id;
        } else {
          // create new suburb (store with proper capitalization)
          const formattedName = trimmedName
            .split(" ")
            .map((word: string) => {
              // if word is all upper case (like CBD), keep it
              if (word === word.toUpperCase() && word.length > 1) {
                return word;
              }
              // otherwise, title case
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(" ");
          const [newSuburb] = await db.insert(suburbs).values({ name: formattedName }).returning();
          suburbId = newSuburb.id;
        }
      }
    }
    
    // handle cuisine
    if (cuisineId) {
      if (!cuisineId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const existingCuisine = await db
          .select()
          .from(cuisines)
          .where(eq(cuisines.name, cuisineId))
          .limit(1);
        
        if (existingCuisine.length > 0) {
          cuisineId = existingCuisine[0].id;
        } else {
          const [newCuisine] = await db.insert(cuisines).values({ name: cuisineId }).returning();
          cuisineId = newCuisine.id;
        }
      }
    }

    // handle dietary reqs (converts names to id)
    const dietaryReqIds: string[] = [];
    if (body.dietaryReqIds && body.dietaryReqIds.length > 0) {
      for (const reqInput of body.dietaryReqIds) {
        // check if it's uuid or name
        if (reqInput.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          dietaryReqIds.push(reqInput);
        } else {
          // it's a name, find or create
          const existingReq = await db
            .select()
            .from(dietaryReqs)
            .where(eq(dietaryReqs.name, reqInput))
            .limit(1);
          
          if (existingReq.length > 0) {
            dietaryReqIds.push(existingReq[0].id);
          } else {
            const [newReq] = await db.insert(dietaryReqs).values({ name: reqInput }).returning();
            dietaryReqIds.push(newReq.id);
          }
        }
      }
    }

    // handle tags (converts names to id)
    const tagIds: string[] = [];
    if (body.tagIds && body.tagIds.length > 0) {
      for (const tagInput of body.tagIds) {
        if (tagInput.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          tagIds.push(tagInput);
        } else {
          const existingTag = await db
            .select()
            .from(tags)
            .where(eq(tags.name, tagInput))
            .limit(1);
          
          if (existingTag.length > 0) {
            tagIds.push(existingTag[0].id);
          } else {
            const [newTag] = await db.insert(tags).values({ name: tagInput }).returning();
            tagIds.push(newTag.id);
          }
        }
      }
    }
    
    const [restaurant] = await db.insert(restaurants).values({
      userId: userId,
      name: body.name,
      suburbId: suburbId || null,
      cuisineId: cuisineId || null,
      url: body.url,
      source: body.source,
      openingHours: body.openingHours || {},
    }).returning();

    // handle dietary reqs (m:n relationship)
    if (dietaryReqIds.length > 0) {
      const reqValues = dietaryReqIds.map((reqId: string) => ({
        restaurantId: restaurant.id,
        dietaryReqId: reqId,
      }));

      await db.insert(restaurantDietaryReqs).values(reqValues);
    }

    // handle tags (m:n relationship)
    if (tagIds.length > 0) {
      const tagValues = tagIds.map((tagId: string) => ({
        restaurantId: restaurant.id,
        tagId: tagId,
      }));

      await db.insert(restaurantTags).values(tagValues);
    }
    
    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("POST /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

// ----------------------
// GET /api/restaurants
// with filtering
// ----------------------
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    
    // if not authenticated, return empty array
    if (!userId) {
      return NextResponse.json([], { status: 200 })
    }

    const { searchParams } = new URL(req.url);
    
    // extract query parameters
    const suburbIds = searchParams.getAll("suburbId");
    const cuisineIds = searchParams.getAll("cuisineId");
    const dietaryReqIds = searchParams.getAll("dietaryReqId");
    const tagIds = searchParams.getAll("tagId");
    const search = searchParams.get("search"); // for searching by name
    const openNow = searchParams.get("openNow");
    const timezone = searchParams.get("timezone") || "Australia/Melbourne";
    
    // build filter conditions array
    const conditions = [];

    // always filter by current user
    conditions.push(eq(restaurants.userId, userId))
    
    // handle multiple suburbs (OR condition)
    if (suburbIds.length > 0) {
      conditions.push(inArray(restaurants.suburbId, suburbIds));
    }

    // handle multiple cuisines (OR condition)
    if (cuisineIds.length > 0) {
      conditions.push(inArray(restaurants.cuisineId, cuisineIds));
    }
    
    if (search) {
      // case insensitive search in restaurant name
      conditions.push(ilike(restaurants.name, `%${search}%`));
    }

    // base query with joins
    let query = db
      .select({
        restaurant: restaurants,
        suburb: suburbs,
        cuisine: cuisines,
      })
      .from(restaurants)
      .leftJoin(suburbs, eq(restaurants.suburbId, suburbs.id))
      .leftJoin(cuisines, eq(restaurants.cuisineId, cuisines.id));
    
    // apply filters
    if (conditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = query.where(and(...conditions)) as any;
    }
    
    let results = await query;
    
    // filter by dietary req if specified
    if (dietaryReqIds.length > 0) {
      const restaurantIds = await db
        .select({ restaurantId: restaurantDietaryReqs.restaurantId })
        .from(restaurantDietaryReqs)
        .where(inArray(restaurantDietaryReqs.dietaryReqId, dietaryReqIds));
      
      const ids = restaurantIds.map(r => r.restaurantId);
      results = results.filter(r => ids.includes(r.restaurant.id));
    }

    // filter by tag if specified
    if (tagIds.length > 0) {
      const restaurantIds = await db
        .select({ restaurantId: restaurantTags.restaurantId })
        .from(restaurantTags)
        .where(inArray(restaurantTags.tagId, tagIds));
      
      const ids = restaurantIds.map(r => r.restaurantId);
      results = results.filter(r => ids.includes(r.restaurant.id));
    }
    
    // fetch all dietary reqs for all restaurants
    const allDietaryReqs = await db
      .select({
        restaurantId: restaurantDietaryReqs.restaurantId,
        req: dietaryReqs
      })
      .from(restaurantDietaryReqs)
      .leftJoin(dietaryReqs, eq(restaurantDietaryReqs.dietaryReqId, dietaryReqs.id));

    // fetch all tags for all restaurants
    const allTags = await db
      .select({
        restaurantId: restaurantTags.restaurantId,
        tag: tags
      })
      .from(restaurantTags)
      .leftJoin(tags, eq(restaurantTags.tagId, tags.id));

    // group dietary reqs by restaurant id
    const dietaryReqsByRestaurant = allDietaryReqs.reduce((acc, item) => {
      if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
      if (item.req) acc[item.restaurantId].push(item.req);
      return acc;
    }, {} as Record<string, typeof dietaryReqs.$inferSelect[]>);

    // group tags by restaurant id
    const tagsByRestaurant = allTags.reduce((acc, item) => {
      if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
      if (item.tag) acc[item.restaurantId].push(item.tag);
      return acc;
    }, {} as Record<string, typeof tags.$inferSelect[]>);

    // combine everything
    let restaurantsWithData = results.map((result) => ({
      ...result.restaurant,
      suburb: result.suburb,
      cuisine: result.cuisine,
      dietaryReqs: dietaryReqsByRestaurant[result.restaurant.id] || [],
      tags: tagsByRestaurant[result.restaurant.id] || [],
    }));

    // filter by "open now"
    if (openNow === "true") {
      // convert to user's timezone
      const userTimeString = new Date().toLocaleString("en-US", { 
        timeZone: timezone
      });
      const now = new Date(userTimeString);
      const dayOfWeek = now.getDay(); // 0 = sunday, 1 = monday, ..., 6 = saturday
      const currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 1430 for 2:30pm
      
      restaurantsWithData = restaurantsWithData.filter(restaurant => {
        // skip restaurants without opening hours data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hours = restaurant.openingHours as any;
        if (!hours || !hours.periods) {
          return false;
        }
        
        // find periods for today
        const todaysPeriods = hours.periods.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (period: any) => period.open.day === dayOfWeek
        );
        
        // check if currently open
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return todaysPeriods.some((period: any) => {
          const openTime = parseInt(period.open.time);
          const closeTime = period.close ? parseInt(period.close.time) : 2359;
          
          // handle closing time after midnight
          if (closeTime < openTime) {
            // e.g., opens at 2000 (8pm), closes at 0200 (2am next day)
            return currentTime >= openTime || currentTime <= closeTime;
          }
          
          return currentTime >= openTime && currentTime <= closeTime;
        });
      });
    }
    
    return NextResponse.json(restaurantsWithData, { status: 200 });
    
  } catch (error) {
    console.error("GET /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}