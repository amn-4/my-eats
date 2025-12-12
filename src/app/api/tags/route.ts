// src\app\api\tags\route.ts

import { db } from "../../../../lib/drizzle";
import { tags } from "../../../../drizzle/schema";
import { ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET all tags
export async function GET() {
  try {
    const allTags = await db.select().from(tags).orderBy(tags.name);
    return NextResponse.json(allTags, { status: 200 });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST create new tag
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    // checks for duplicates before inserting
    const existing = await db
      .select()
      .from(tags)
      .where(ilike(tags.name, body.name.trim()))
      .limit(1);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `"${existing[0].name}" already exists` },
        { status: 409 }
      );
    }
    
    const formattedName = body.name.trim().toLowerCase(); // lowercase for tags
    
    const [tag] = await db.insert(tags).values({
      name: formattedName,
    }).returning();
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("POST /api/tags error:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}