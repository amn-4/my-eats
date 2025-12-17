// src\app\page.tsx

"use client"

import { useEffect, useState } from "react";
import { Container, Typography, Grid } from "@mui/material";
import RestaurantCard from "@/components/RestaurantCard";

// type definition for restaurant data structure from API
type Restaurant = {
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

export default function HomePage() {
  // state to store array of restaurants fetched from API
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  // state for loading status
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // fetch data from API endpoint
    fetch("/api/restaurants")
      .then(res => res.json()) // convert response to json
      .then(data => { // when json is ready
        setRestaurants(data) // store restaurants in state
        setLoading(false) // // hide loading indicator
      })
  }, []) // empty array means it only runs once when page loads
  
  return (
    <Container sx={{ py: 4 }}>
      {/* page title */}
      <Typography variant="h3" align="center" sx={{ mb: 4 }}>
        Restaurants
      </Typography>

      {/* show loading text while fetching */}
      {loading && <Typography>Loading...</Typography>}
      
      {/* responsive grid */}
      <Grid container spacing={2}>
        {restaurants.map(restaurant => (
          <Grid key={restaurant.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <RestaurantCard restaurant={restaurant} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
