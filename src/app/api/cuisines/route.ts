// src\app\api\cuisines\route.ts

import { db } from "../../../../lib/drizzle";
import { cuisines } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";

// GET all cuisines
export async function GET() {
  try {
    const allCuisines = await db.select().from(cuisines).orderBy(cuisines.name);
    return NextResponse.json(allCuisines, { status: 200 });
  } catch (error) {
    console.error("GET /api/cuisines error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cuisines" },
      { status: 500 }
    );
  }
}

// POST create new cuisine
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    const [cuisine] = await db.insert(cuisines).values({
      name: body.name,
    }).returning();
    
    return NextResponse.json(cuisine, { status: 201 });
  } catch (error) {
    console.error("POST /api/cuisines error:", error);
    return NextResponse.json(
      { error: "Failed to create cuisine" },
      { status: 500 }
    );
  }
}