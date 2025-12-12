// src\app\api\suburbs\route.ts

import { db } from "../../../../lib/drizzle";
import { suburbs } from "../../../../drizzle/schema";
import { ilike } from "drizzle-orm";
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
    
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    // checks for duplicates before inserting
    const existing = await db
      .select()
      .from(suburbs)
      .where(ilike(suburbs.name, body.name.trim()))
      .limit(1);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `"${existing[0].name}" already exists` },
        { status: 409 }
      );
    }

    const formattedName = body.name.trim().charAt(0).toUpperCase() + body.name.trim().slice(1).toLowerCase();
    
    const [suburb] = await db.insert(suburbs).values({
      name: formattedName,
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