// src\app\page.tsx

"use client"

import { Restaurant } from "@/types/restaurant"
import { useEffect, useState } from "react";
import { Container, Typography, Grid } from "@mui/material";
import RestaurantCard from "@/components/RestaurantCard";
import FilterBar from "@/components/FilterBar";

export default function HomePage() {
  // state to store array of restaurants fetched from API
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  // state for active filter values
  const [activeFilters, setActiveFilters] = useState({
    suburbId: "",
    cuisineId: "",
    dietaryReqId: "",
    tagId: "",
    openNow: false
  })

  // state for loading status
  const [loading, setLoading] = useState(true)

  // fetch restaurants whenever active filters change
  useEffect(() => {
    // build query string from active filters
    const params = new URLSearchParams()
    if (activeFilters.suburbId) params.append("suburbId", activeFilters.suburbId)
    if (activeFilters.cuisineId) params.append("cuisineId", activeFilters.cuisineId)
    if (activeFilters.dietaryReqId) params.append("dietaryReqId", activeFilters.dietaryReqId)
    if (activeFilters.tagId) params.append("tagId", activeFilters.tagId)
    if (activeFilters.openNow) params.append("openNow", "true")
    
      // fetch restaurants with filter parameters in url
    fetch(`/api/restaurants?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setRestaurants(data)
        setLoading(false)
      })
  }, [activeFilters]) // re-run whenever active filter changes

  // handle restaurant deletion - remove from list without reloading page
  const handleRestaurantDeleted = (id: string) => {
    setRestaurants(prev => prev.filter(r => r.id !== id))
  }
  
  return (
    <Container sx={{ py: 4 }}>
      {/* page title */}
      <Typography variant="h3" align="center" sx={{ mb: 4 }}>
        Restaurants
      </Typography>

      <FilterBar onFiltersChange={setActiveFilters} />

      {/* show loading text while fetching */}
      {loading && <Typography>Loading...</Typography>}
      
      {/* responsive grid */}
      <Grid container spacing={2}>
        {restaurants.map(restaurant => (
          <Grid key={restaurant.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <RestaurantCard restaurant={restaurant} onDeleted={handleRestaurantDeleted} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}