// src\app\api\restaurants\route.ts

import { db } from "../../../../lib/drizzle";
import { restaurants, restaurantDietaryTags, suburbs, cuisines, dietaryTags } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";
import { eq, and, ilike } from "drizzle-orm";

// ----------------------
// POST /api/restaurants
// ----------------------
export async function POST(req: Request) {
  try {
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
          const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
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

    // handle dietary tags (converts names to id)
    const dietaryTagIds: string[] = [];
    if (body.dietaryTagIds && body.dietaryTagIds.length > 0) {
      for (const tagInput of body.dietaryTagIds) {
        // check if it's uuid or name
        if (tagInput.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          dietaryTagIds.push(tagInput);
        } else {
          // it's a name, find or create
          const existingTag = await db
            .select()
            .from(dietaryTags)
            .where(eq(dietaryTags.name, tagInput))
            .limit(1);
          
          if (existingTag.length > 0) {
            dietaryTagIds.push(existingTag[0].id);
          } else {
            const [newTag] = await db.insert(dietaryTags).values({ name: tagInput }).returning();
            dietaryTagIds.push(newTag.id);
          }
        }
      }
    }
    
    const [restaurant] = await db.insert(restaurants).values({
      name: body.name,
      suburbId: suburbId || null,
      cuisineId: cuisineId || null,
      url: body.url,
      source: body.source,
      openingHours: body.openingHours || {},
    }).returning();

    // handle dietary tags (m:n relationship)
    if (dietaryTagIds.length > 0) {
      const tagValues = dietaryTagIds.map((tagId: string) => ({
        restaurantId: restaurant.id,
        dietaryTagId: tagId,
      }));

      await db.insert(restaurantDietaryTags).values(tagValues);
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
    const { searchParams } = new URL(req.url);
    
    // extract query parameters
    const suburbId = searchParams.get("suburbId");
    const cuisineId = searchParams.get("cuisineId");
    const dietaryTagId = searchParams.get("dietaryTagId");
    const search = searchParams.get("search"); // for searching by name
    const openNow = searchParams.get("openNow");
    
    // build filter conditions array
    const conditions = [];
    
    if (suburbId) {
      conditions.push(eq(restaurants.suburbId, suburbId));
    }
    
    if (cuisineId) {
      conditions.push(eq(restaurants.cuisineId, cuisineId));
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
    
    // filter by dietary tag if specified
    if (dietaryTagId) {
      const restaurantIds = await db
        .select({ restaurantId: restaurantDietaryTags.restaurantId })
        .from(restaurantDietaryTags)
        .where(eq(restaurantDietaryTags.dietaryTagId, dietaryTagId));
      
      const ids = restaurantIds.map(r => r.restaurantId);
      results = results.filter(r => ids.includes(r.restaurant.id));
    }
    
    // fetch dietary tags for each restaurant
    let restaurantsWithTags = await Promise.all(
      results.map(async (result) => {
        const tags = await db
          .select({ tag: dietaryTags })
          .from(restaurantDietaryTags)
          .leftJoin(dietaryTags, eq(restaurantDietaryTags.dietaryTagId, dietaryTags.id))
          .where(eq(restaurantDietaryTags.restaurantId, result.restaurant.id));
        
        return {
          ...result.restaurant,
          suburb: result.suburb,
          cuisine: result.cuisine,
          dietaryTags: tags.map(t => t.tag).filter(Boolean),
        };
      })
    );

    // filter by "open now"
    if (openNow === "true") {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = sunday, 1 = monday, ..., 6 = saturday
      const currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 1430 for 2:30pm
      
      restaurantsWithTags = restaurantsWithTags.filter(restaurant => {
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
    
    return NextResponse.json(restaurantsWithTags, { status: 200 });
    
  } catch (error) {
    console.error("GET /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}