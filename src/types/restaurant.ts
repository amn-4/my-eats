// src\types\restaurant.ts

// type definition for restaurant data structure from API
export type Restaurant = {
  id: string
  name: string
  suburb: { id: string; name: string } | null
  cuisine: { id: string; name: string } | null
  dietaryReqs: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
  source: string | null
  url: string | null
  address: string | null
  openingHours: {
    weekdayText?: string[]
    periods?: Array<{ open: { day: number; time: string } }>
  } | null
  googleMapsUrl: string | null
  createdAt: string
}