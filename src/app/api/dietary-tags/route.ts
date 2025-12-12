// src\app\api\dietary-tags\route.ts

import { db } from "../../../../lib/drizzle";
import { dietaryTags } from "../../../../drizzle/schema";
import { ilike } from "drizzle-orm";
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

    // checks for duplicates before inserting
    const existing = await db
      .select()
      .from(dietaryTags)
      .where(ilike(dietaryTags.name, body.name.trim()))
      .limit(1);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `"${existing[0].name}" already exists` },
        { status: 409 }
      );
    }
    
    const formattedName = body.name.trim().toLowerCase(); // lowercase for dietary tags
    
    const [tag] = await db.insert(dietaryTags).values({
      name: formattedName,
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