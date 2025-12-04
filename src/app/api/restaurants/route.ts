import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

// this function handles POST requests to /api/restaurants
export async function POST(req: Request) {
  try {
    // reads the json from incoming request
    const body = await req.json();

    // creates new restaurant record in the db
    const restaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        suburb: body.suburb,
        cuisine: body.cuisine,
        url: body.url,
        source: body.source,
        // if missing, default to empty array/object
        dietaryTags: body.dietaryTags || [],
        openingHours: body.openingHours || {},
      },
    });

    // returns new restaurant as json with http 201 created
    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    // if anything fails, log error and return a 500 response
    console.error("POST /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}