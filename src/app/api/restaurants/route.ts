import { db } from "../../../../lib/drizzle";
import { restaurants } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";

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
// ----------------------
export async function GET() {
  try {
    const allRestaurants = await db.select().from(restaurants);
    return NextResponse.json(allRestaurants, { status: 200 });
  } catch (error) {
    console.error("GET /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}