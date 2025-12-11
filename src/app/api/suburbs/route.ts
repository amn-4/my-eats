// src\app\api\suburbs\route.ts

import { db } from "../../../../lib/drizzle";
import { suburbs } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";

// GET all suburbs
export async function GET() {
  try {
    const allSuburbs = await db.select().from(suburbs).orderBy(suburbs.name);
    return NextResponse.json(allSuburbs, { status: 200 });
  } catch (error) {
    console.error("GET /api/suburbs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suburbs" },
      { status: 500 }
    );
  }
}

// POST create new suburb
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    const [suburb] = await db.insert(suburbs).values({
      name: body.name,
    }).returning();
    
    return NextResponse.json(suburb, { status: 201 });
  } catch (error) {
    console.error("POST /api/suburbs error:", error);
    return NextResponse.json(
      { error: "Failed to create suburb" },
      { status: 500 }
    );
  }
}