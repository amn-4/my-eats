import { db } from "../../../../../lib/drizzle";
import { restaurants } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/restaurants/:id
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