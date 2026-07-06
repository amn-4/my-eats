// src\app\api\restaurants\[id]\refresh\route.ts

import { db } from "../../../../../../lib/drizzle";
import { restaurants } from "../../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// ------------------------------------
// POST /api/restaurants/:id/refresh
// re-fetches restaurant data from google places to keep hours/address up to date
// ------------------------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // get the restaurant id from the url
    const { id } = await params;

    // check if user is logged in
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // find the restaurant in the database
    // (also checks it belongs to this user, so people can't refresh others' restaurants)
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(and(eq(restaurants.id, id), eq(restaurants.userId, userId)))
      .limit(1);

    // if restaurant doesn't exist (or doesn't belong to this user), stop here
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // can't refresh if we never had a google place id saved for this restaurant
    // (this happens if it was added without a suburb, since that's what triggers the google lookup)
    if (!restaurant.googlePlaceId) {
      return NextResponse.json({ error: "No Google Place ID" }, { status: 400 });
    }

    // call google places api to get the latest info for this restaurant
    const googleData = await fetchGooglePlacesData(restaurant.googlePlaceId);

    // if google places api call failed for any reason, stop here
    if (!googleData) {
      return NextResponse.json({ error: "Failed to fetch Google data" }, { status: 500 });
    }

    // update the restaurant row with the new data we just got
    // also update "lastUpdated" so we know not to refresh again for a while
    const [updated] = await db
      .update(restaurants)
      .set({
        address: googleData.address,
        phone: googleData.phone,
        openingHours: googleData.openingHours,
        googleMapsUrl: googleData.mapsUrl,
        lastUpdated: new Date().toISOString(),
      })
      .where(and(eq(restaurants.id, id), eq(restaurants.userId, userId)))
      .returning();

    // send back the updated restaurant
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("POST /api/restaurants/[id]/refresh error:", error);
    return NextResponse.json({ error: "Failed to refresh" }, { status: 500 });
  }
}

// ------------------------------------
// helper function that calls google places "details" endpoint
// takes a placeId (saved when restaurant was first added) and returns new info
// ------------------------------------
async function fetchGooglePlacesData(placeId: string) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // if the api key isn't set, we can't make the request, so just return null
    if (!apiKey) {
      console.warn("Google Places API key not configured");
      return null;
    }

    // build the url to ask google for details about this specific place
    // "fields" tells google exactly what info we want back (keeps the request cheap)
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,opening_hours,url&key=${apiKey}`;

    // make the actual request to google
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    // check if the request was successful
    if (detailsData.status !== "OK") { 
      console.warn(`Failed to fetch place details: ${detailsData.status}`); //
      return null;
    }

    // pull out the actual place data from google's response
    const place = detailsData.result;

    // return the info we care about in a simple object
    return {
      mapsUrl: place.url,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      // opening_hours might not exist for every place, so check first
      openingHours: place.opening_hours
        ? {
            weekdayText: place.opening_hours.weekday_text,
            periods: place.opening_hours.periods,
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching Google Places data:", error);
    return null;
  }
}