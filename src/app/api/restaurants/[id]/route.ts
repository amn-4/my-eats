// src\app\api\restaurants\[id]\route.ts

import { db } from "../../../../../lib/drizzle";
import { restaurants } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
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
    
    // query database for this specific restaurant
    const result = await db
      .select() 
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);
    
    // if no restaurant found, return 404
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }
    
    // return restaurant
    return NextResponse.json(result[0]);
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
    
    // build updates object with only defined fields
    // restaurants.$inferInsert looks at drizzle schema and creates all the fields and their types
    // Partial<...> makes all fields optional (when updating a restaurant, you might change only 1 or 2 fields)
    const updates: Partial<typeof restaurants.$inferInsert> = {}; // start with empty object
    
    // checks name of restaurant
    if (body.name !== undefined) // is name in the request?
        updates.name = body.name; // if so, add it: updates = { name: "example name" } & if not, skip line
    // etc
    if (body.suburb !== undefined) updates.suburb = body.suburb;
    if (body.cuisine !== undefined) updates.cuisine = body.cuisine;
    if (body.url !== undefined) updates.url = body.url;
    if (body.source !== undefined) updates.source = body.source;
    if (body.dietaryTags !== undefined) updates.dietaryTags = body.dietaryTags;
    if (body.openingHours !== undefined) updates.openingHours = body.openingHours;
    
    // update database
    const updated = await db
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
    
    // delete from database
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
