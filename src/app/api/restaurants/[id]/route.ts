// src\app\api\restaurants\[id]\route.ts

import { db } from "../../../../../lib/drizzle";
import {
  restaurants, 
  restaurantDietaryReqs, 
  restaurantTags, 
  suburbs, 
  cuisines, 
  dietaryReqs, 
  tags 
} from "../../../../../drizzle/schema";
import { eq, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

// -------------------------
// GET /api/restaurants/:id
// -------------------------
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // query with joins
    const result = await db
      .select({
        restaurant: restaurants,
        suburb: suburbs,
        cuisine: cuisines,
      })
      .from(restaurants)
      .leftJoin(suburbs, eq(restaurants.suburbId, suburbs.id))
      .leftJoin(cuisines, eq(restaurants.cuisineId, cuisines.id))
      .where(eq(restaurants.id, id))
      .limit(1);
    
    // if no restaurant found, return 404
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // fetch dietary requirements
    const reqs = await db
      .select({ req: dietaryReqs })
      .from(restaurantDietaryReqs)
      .leftJoin(dietaryReqs, eq(restaurantDietaryReqs.dietaryReqId, dietaryReqs.id))
      .where(eq(restaurantDietaryReqs.restaurantId, id));

    // fetch tags
    const restaurantTagsData = await db
      .select({ tag: tags })
      .from(restaurantTags)
      .leftJoin(tags, eq(restaurantTags.tagId, tags.id))
      .where(eq(restaurantTags.restaurantId, id));
    
    const restaurant = {
      ...result[0].restaurant,
      suburb: result[0].suburb,
      cuisine: result[0].cuisine,
      dietaryReqs: reqs.map(r => r.req).filter(Boolean), // for each item "r" in the "reqs" array, get r.req
      tags: restaurantTagsData.map(t => t.tag).filter(Boolean),
    };
    
    // return restaurant
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("GET /api/restaurants/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

// -------------------------
// PUT /api/restaurants/:id
// -------------------------
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // parse the id
    const { id } = await params;
    // parse the json body
    const body = await req.json();

    // checks if at least one field is provided
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }
    
    // if name is provided, ensure it's not empty
    if (body.name !== undefined && body.name.trim() === "") {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }
    
    // build updates object with only defined fields
    // restaurants.$inferInsert looks at drizzle schema and creates all the fields and their types
    // Partial<...> makes all fields optional (when updating a restaurant, you might change only 1 or 2 fields)
    const updates: Partial<typeof restaurants.$inferInsert> = {}; // start with empty object
    
    // checks name of restaurant
    if (body.name !== undefined) // is name in the request?
        updates.name = body.name; // if so, add it: updates = { name: "example name" } & if not, skip line

    // handle suburb (convert name to id if needed)
    if (body.suburbId !== undefined) {
      let suburbId = body.suburbId
      
      // if it doesn't look like uuid, treat it as a name
      if (suburbId && !suburbId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const trimmedName = suburbId.trim()
        
        // check if suburb exists
        const existingSuburb = await db
          .select()
          .from(suburbs)
          .where(ilike(suburbs.name, suburbId))
          .limit(1)
        
        if (existingSuburb.length > 0) {
          suburbId = existingSuburb[0].id
        } else {
          // create new suburb with proper capitalization
          const formattedName = trimmedName
            .split(" ")
            .map((word: string) => {
              if (word === word.toUpperCase() && word.length > 1) {
                return word
              }
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            })
            .join(" ")
          const [newSuburb] = await db.insert(suburbs).values({ name: formattedName }).returning()
          suburbId = newSuburb.id
        }
      }
      
      updates.suburbId = suburbId
    }

    // handle cuisine (convert name to id if needed)
    if (body.cuisineId !== undefined) {
      let cuisineId = body.cuisineId
      
      if (cuisineId && !cuisineId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const existingCuisine = await db
          .select()
          .from(cuisines)
          .where(eq(cuisines.name, cuisineId))
          .limit(1)
        
        if (existingCuisine.length > 0) {
          cuisineId = existingCuisine[0].id
        } else {
          const [newCuisine] = await db.insert(cuisines).values({ name: cuisineId }).returning()
          cuisineId = newCuisine.id
        }
      }
      
      updates.cuisineId = cuisineId
    }
    if (body.url !== undefined) updates.url = body.url;
    if (body.source !== undefined) updates.source = body.source;
    if (body.openingHours !== undefined) updates.openingHours = body.openingHours;
    
    // only update restaurant table if there are fields to update
    let updated;
    if (Object.keys(updates).length > 0) {
      updated = await db
        .update(restaurants)
        .set(updates)
        .where(eq(restaurants.id, id))
        .returning();
        
      if (updated.length === 0) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }
    } else {
      // if only updating tags/dietaryReqs, just fetch restaurant
      updated = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, id));
      
      if (updated.length === 0) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }
    }

    // handle dietary reqs
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

    // handle tags (convert names to IDs)
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

    // handle dietary reqs if provided
    if (body.dietaryReqIds !== undefined) {
      // delete existing reqs
      await db
        .delete(restaurantDietaryReqs)
        .where(eq(restaurantDietaryReqs.restaurantId, id));
      
      // insert new reqs
      if (dietaryReqIds.length > 0) {
        const reqValues = dietaryReqIds.map((reqId: string) => ({
          restaurantId: id,
          dietaryReqId: reqId,
        }));
        
        await db.insert(restaurantDietaryReqs).values(reqValues);
      }
    }

    // handle tags if provided
    if (body.tagIds !== undefined) {
      // delete existing tags
      await db
        .delete(restaurantTags)
        .where(eq(restaurantTags.restaurantId, id));
      
      // insert new tags
      if (tagIds.length > 0) {
        const tagValues = tagIds.map((tagId: string) => ({
          restaurantId: id,
          tagId: tagId,
        }));
        
        await db.insert(restaurantTags).values(tagValues);
      }
    }
    
    // return updated row
    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    // handle errors
    console.error("PUT /api/restaurants/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 }
    );
  }
}

// ----------------------------
// DELETE /api/restaurants/:id
// ----------------------------
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // parse the id
    const { id } = await params;
    
    // delete restaurant from database (dietary reqs and tags will cascade delete)
    const deleted = await db
      .delete(restaurants)
      .where(eq(restaurants.id, id))
      .returning();
    
    // if nothing was deleted, restaurant doesn't exist
    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }
    
    // return success
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/restaurants/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}
