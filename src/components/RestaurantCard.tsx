// src\components\RestaurantCard.tsx

"use client"

import { useState } from "react";
import { Card, CardContent, Typography, Chip, Stack, Collapse  } from "@mui/material";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import Link from "@mui/material/Link";

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

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    // useState to track if card is expanded (true) or collapsed (false)
    const [expanded, setExpanded] = useState(false)
  
    // toggle function: flips expanded state (true -> false or false -> true)
    const handleExpandClick = () => setExpanded(!expanded)

  return (
    <Card sx={{ mb: 2}}>
        {/* main card content. clickable to expand/collapse */}
        <CardContent onClick={handleExpandClick} sx={{ cursor: "pointer" }}>
            {/* restaurant name */}
            <Typography variant="h5" sx={{ color: "text.primary" }}>
                {restaurant.name}
            </Typography>

            {/* suburb and cuisine. optional chaining (?.) handles null values */}
            <Typography variant="body2" color="text.secondary">
                {restaurant.suburb?.name} • {restaurant.cuisine?.name}
            </Typography>

            {/* dietary reqs */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {restaurant.dietaryReqs.map(req => (
                    <Chip key={req.id} label={req.name} />
                ))}
            </Stack>

            {/* tags */}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {restaurant.tags.map(tag => (
                    <Chip key={tag.id} size="small" label={tag.name} color="secondary" />
                ))}
            </Stack>
        </CardContent>

      <Collapse in={expanded}>
        <CardContent>
            {/* address */}
            {restaurant.address && ( // && operator for conditional rendering (if address or opening hours are not null/empty)
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationPinIcon fontSize="small" />
                    <Link href={restaurant.googleMapsUrl || "#"} target="_blank" rel="noopener noreferrer" underline="hover">
                        {restaurant.address}
                    </Link>
                </Typography>
                )}

            {/* opening hours */}
            {restaurant.openingHours?.weekdayText && (
                <>
                    <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: "bold" }}>
                        Opening hours:
                    </Typography>
                    {restaurant.openingHours.weekdayText.map((day, index) => (
                        <Typography key={index} variant="body2">
                            {day}
                        </Typography>
                    ))}
                </>
            )}
        </CardContent>
      </Collapse>
    </Card>
  )
}