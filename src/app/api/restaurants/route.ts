// src\app\api\restaurants\route.ts

import { db } from "../../../../lib/drizzle";
import { restaurants } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";
import { and, ilike, arrayContains } from "drizzle-orm";

// ----------------------
// POST /api/restaurants
// ----------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const [restaurant] = await db.insert(restaurants).values({
      name: body.name,
      suburb: body.suburb,
      cuisine: body.cuisine,
      url: body.url,
      source: body.source,
      dietaryTags: body.dietaryTags || [],
      openingHours: body.openingHours || {},
    }).returning();
    
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
    const suburb = searchParams.get("suburb");
    const cuisine = searchParams.get("cuisine");
    const dietary = searchParams.get("dietary");
    const search = searchParams.get("search"); // for searching by name
    
    // build filter conditions array
    const conditions = [];
    
    if (suburb) {
      conditions.push(ilike(restaurants.suburb, suburb));
    }
    
    if (cuisine) {
      conditions.push(ilike(restaurants.cuisine, cuisine));
    }
    
    if (dietary) {
      // check if dietaryTags array contains the dietary restriction
      conditions.push(arrayContains(restaurants.dietaryTags, [dietary]));
    }
    
    if (search) {
      // case insensitive search in restaurant name
      conditions.push(ilike(restaurants.name, `%${search}%`));
    }
    
    // execute query with or without filters
    const allRestaurants = conditions.length > 0
      ? await db.select().from(restaurants).where(and(...conditions))
      : await db.select().from(restaurants);

    return NextResponse.json(allRestaurants, { status: 200 });
    
  } catch (error) {
    console.error("GET /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}