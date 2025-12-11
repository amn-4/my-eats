// src\app\api\dietary-tags\route.ts

import { db } from "../../../../lib/drizzle";
import { dietaryTags } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";

// GET all dietary tags
export async function GET() {
  try {
    const allTags = await db.select().from(dietaryTags).orderBy(dietaryTags.name);
    return NextResponse.json(allTags, { status: 200 });
  } catch (error) {
    console.error("GET /api/dietary-tags error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dietary tags" },
      { status: 500 }
    );
  }
}

// POST create new dietary tag
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    const [tag] = await db.insert(dietaryTags).values({
      name: body.name,
    }).returning();
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("POST /api/dietary-tags error:", error);
    return NextResponse.json(
      { error: "Failed to create dietary tag" },
      { status: 500 }
    );
  }
}