// src\app\api\dietary-reqs\route.ts

import { db } from "../../../../lib/drizzle";
import { dietaryReqs } from "../../../../drizzle/schema";
import { ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET all dietary requirements
export async function GET() {
  try {
    const allReqs = await db.select().from(dietaryReqs).orderBy(dietaryReqs.name);
    return NextResponse.json(allReqs, { status: 200 });
  } catch (error) {
    console.error("GET /api/dietary-reqs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dietary requirements" },
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
      .from(dietaryReqs)
      .where(ilike(dietaryReqs.name, body.name.trim()))
      .limit(1);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `"${existing[0].name}" already exists` },
        { status: 409 }
      );
    }
    
    const formattedName = body.name.trim().toLowerCase(); // lowercase for dietary requirements
    
    const [tag] = await db.insert(dietaryReqs).values({
      name: formattedName,
    }).returning();
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("POST /api/dietary-reqs error:", error);
    return NextResponse.json(
      { error: "Failed to create dietary requirement" },
      { status: 500 }
    );
  }
}