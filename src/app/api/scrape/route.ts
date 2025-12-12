// src\app\api\scrape\route.ts

import { db } from "../../../../lib/drizzle";
import { restaurants, restaurantDietaryTags, suburbs, cuisines, dietaryTags } from "../../../../drizzle/schema";
import { NextResponse } from "next/server";
import { eq, ilike } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, name, suburb, cuisine, dietaryTags: tags } = body;
    
    // validate required fields
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    if (!name) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }
    
    // determine source from url
    let source = "other";
    if (url.includes("instagram.com")) source = "instagram";
    if (url.includes("tiktok.com")) source = "tiktok";
    
    // handle suburb
    let suburbId = null;
    if (suburb) {
      const trimmedSuburb = suburb.trim();
      const existingSuburb = await db
        .select()
        .from(suburbs)
        .where(ilike(suburbs.name, trimmedSuburb))
        .limit(1);
      
      if (existingSuburb.length > 0) {
        suburbId = existingSuburb[0].id;
      } else {
        const formattedName = trimmedSuburb.charAt(0).toUpperCase() + trimmedSuburb.slice(1).toLowerCase();
        const [newSuburb] = await db.insert(suburbs).values({ name: formattedName }).returning();
        suburbId = newSuburb.id;
      }
    }
    
    // handle cuisine
    let cuisineId = null;
    if (cuisine) {
      const trimmedCuisine = cuisine.trim();
      const existingCuisine = await db
        .select()
        .from(cuisines)
        .where(ilike(cuisines.name, trimmedCuisine))
        .limit(1);
      
      if (existingCuisine.length > 0) {
        cuisineId = existingCuisine[0].id;
      } else {
        const formattedName = trimmedCuisine.charAt(0).toUpperCase() + trimmedCuisine.slice(1).toLowerCase();
        const [newCuisine] = await db.insert(cuisines).values({ name: formattedName }).returning();
        cuisineId = newCuisine.id;
      }
    }
    
    // handle dietary tags
    let dietaryTagIds: string[] = [];
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        const trimmedTag = tag.trim();
        const existingTag = await db
          .select()
          .from(dietaryTags)
          .where(ilike(dietaryTags.name, trimmedTag))
          .limit(1);
        
        if (existingTag.length > 0) {
          dietaryTagIds.push(existingTag[0].id);
        } else {
          const formattedName = trimmedTag.toLowerCase();
          const [newTag] = await db.insert(dietaryTags).values({ name: formattedName }).returning();
          dietaryTagIds.push(newTag.id);
        }
      }
    }
    
    // fetch google places data
    let googleData = null;
    if (suburb) {
      googleData = await fetchGooglePlacesData(name, suburb);
    }
    
    // create restaurant
    const [restaurant] = await db.insert(restaurants).values({
      name: name,
      suburbId: suburbId,
      cuisineId: cuisineId,
      url: url,
      source: source,
      
      // google places data
      googlePlaceId: googleData?.placeId || null,
      googleMapsUrl: googleData?.mapsUrl || null,
      address: googleData?.address || null,
      phone: googleData?.phone || null,
      openingHours: googleData?.openingHours || {},
    }).returning();
    
    // add dietary tags
    if (dietaryTagIds.length > 0) {
      const tagValues = dietaryTagIds.map((tagId: string) => ({
        restaurantId: restaurant.id,
        dietaryTagId: tagId,
      }));
      await db.insert(restaurantDietaryTags).values(tagValues);
    }
    
    return NextResponse.json({
      success: true,
      restaurant,
      googleDataFetched: !!googleData,
    }, { status: 201 });
    
  } catch (error) {
    console.error("POST /api/scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape restaurant" },
      { status: 500 }
    );
  }
}

// helper function to fetch Google Places data
async function fetchGooglePlacesData(restaurantName: string, suburb: string) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.warn("Google Places API key not configured - skipping automatic data fetch");
      return null;
    }
    
    // find place by name and location
    const searchQuery = `${restaurantName} ${suburb} Melbourne`;
    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
    
    const findResponse = await fetch(findPlaceUrl);
    const findData = await findResponse.json();
    
    if (!findData.candidates || findData.candidates.length === 0) {
      console.warn(`No Google Place found for: ${searchQuery}`);
      return null;
    }
    
    const placeId = findData.candidates[0].place_id;
    
    // get detailed info about place
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,opening_hours,url&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== "OK") {
      console.warn(`Failed to fetch place details: ${detailsData.status}`);
      return null;
    }
    
    const place = detailsData.result;
    
    return {
      placeId: placeId,
      mapsUrl: place.url,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      openingHours: place.opening_hours ? {
        weekdayText: place.opening_hours.weekday_text,
        periods: place.opening_hours.periods,
      } : null,
    };
    
  } catch (error) {
    console.error("Error fetching Google Places data:", error);
    return null;
  }
}