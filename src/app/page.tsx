// src\app\page.tsx

"use client"

import { Restaurant } from "@/types/restaurant"
import { useEffect, useState } from "react";
import { Container, Typography, Grid, Button, Box } from "@mui/material";
import RestaurantCard from "@/components/RestaurantCard";
import FilterBar from "@/components/FilterBar";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import RestaurantIcon from "@mui/icons-material/Restaurant";

export default function HomePage() {
  // state to store array of restaurants fetched from API
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  // state for active filter values
  const [activeFilters, setActiveFilters] = useState({
    suburbIds: [] as string[],
    cuisineIds: [] as string[],
    dietaryReqIds: [] as string[],
    tagIds: [] as string[],
    openNow: false,
    search: "",
    timezone: "",
  })

  // state for loading status
  const [loading, setLoading] = useState(true)

  // pagination state and math
  const [currentPage, setCurrentPage] = useState(1) // start at page 1
  const itemsPerPage = 12

  const totalPages = Math.ceil(restaurants.length / itemsPerPage)

  // ensure current page is within bounds of total pages
  // (e.g. if filters shrink the list while you're on page 3, this pulls you back to the last real page)
  const safeCurrentPage = Math.min(currentPage, totalPages) || 1

  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const restaurantsToShow = restaurants.slice(startIndex, endIndex)

  useEffect(() => {
    // build query string from active filters
    const params = new URLSearchParams()
    activeFilters.suburbIds.forEach(id => params.append("suburbId", id))
    activeFilters.cuisineIds.forEach(id => params.append("cuisineId", id))
    activeFilters.dietaryReqIds.forEach(id => params.append("dietaryReqId", id))
    activeFilters.tagIds.forEach(id => params.append("tagId", id))
    if (activeFilters.openNow) params.append("openNow", "true")
    if (activeFilters.search) params.append("search", activeFilters.search)
    if (activeFilters.timezone) params.append("timezone", activeFilters.timezone)
    
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

  // handle restaurant update - replace just this restaurant in the list without reloading page
  const handleRestaurantUpdated = (updatedRestaurant: Restaurant) => {
    setRestaurants(prev => prev.map(r => r.id === updatedRestaurant.id ? updatedRestaurant : r))
  }
  
  return (
    <>
      <SignedIn>
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
            {restaurantsToShow.map(restaurant => (
              <Grid key={restaurant.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <RestaurantCard restaurant={restaurant} onDeleted={handleRestaurantDeleted} onUpdated={handleRestaurantUpdated} />
              </Grid>
            ))}
          </Grid>
          {/* pagination controls */}
          {totalPages > 1 && ( // only show pagination if more than 1 page
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={safeCurrentPage === 1}
              >
                Previous
              </Button>

              <Typography>
                Page {safeCurrentPage} of {totalPages}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={safeCurrentPage === totalPages}
              >
                Next
              </Button>
            </Box>
          )}
        </Container>
      </SignedIn>

        <SignedOut>
          <Container sx={{ 
            minHeight: "80vh", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "center",
            textAlign: "center"
          }}>
            <RestaurantIcon sx={{ fontSize: 80, mb: 2, color: "primary.main" }} />
            <Typography variant="h3" sx={{ mb: 2 }}>
              Welcome to MyEats!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Sign in to view and manage your curated restaurant list
            </Typography>
            <SignInButton mode="modal">
              <Button variant="contained" size="large">
                Sign In
              </Button>
            </SignInButton>
          </Container>
      </SignedOut>
    </>
  )
}