// src\components\RestaurantCard.tsx

"use client"

import { Restaurant } from "@/types/restaurant";
import { useState } from "react";
import { Card, CardContent, Typography, Chip, Stack, Box, Collapse  } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { ExpandMore } from "@mui/icons-material";
import { LocationPin } from "@mui/icons-material";
import Link from "@mui/material/Link";

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    // useState to track if card is expanded (true) or collapsed (false)
    const [expanded, setExpanded] = useState(false)
  
    // toggle function: flips expanded state (true -> false or false -> true)
    const handleExpandClick = () => setExpanded(!expanded)

    return (
        <Card sx={{ mb: 2}}>
            {/* main card content. clickable to expand/collapse */}
            <CardContent>
                {/* restaurant name */}
                <Typography variant="h5" sx={{ color: "text.primary" }}>
                    {restaurant.name}
                </Typography>

                {/* suburb and cuisine. optional chaining (?.) handles null values */}
                <Typography variant="body2" color="text.secondary">
                    {restaurant.suburb?.name} • {restaurant.cuisine?.name}
                </Typography>

                {/* dietary reqs */}
                {restaurant.tags.length > 0 ? (
                    // if restaurant has tags, dietary reqs without expandable button to the right
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        {restaurant.dietaryReqs.map(req => (
                            <Chip key={req.id} label={req.name} />
                        ))}
                    </Stack>
                ) : (
                    // if no tags, dietary reqs with button on right
                    <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexGrow: 1 }}>
                            {restaurant.dietaryReqs.map(req => (
                                <Chip key={req.id} label={req.name} />
                            ))}
                        </Box>
                        <IconButton
                            onClick={handleExpandClick}
                            sx={{ 
                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s",
                                marginLeft: "auto"
                            }}
                            aria-label="show more"
                        >
                            <ExpandMore />
                        </IconButton>
                    </Stack>
                )}
                

                {/* tags row with expand button, if tags exist */}
                {restaurant.tags.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
                        {/* tags on left */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexGrow: 1 }}>
                            {restaurant.tags.map(tag => (
                                <Chip key={tag.id} size="small" label={tag.name} color="secondary" />
                            ))}
                        </Box>
                        {/* expand button on the right */}
                        <IconButton
                            onClick={handleExpandClick}
                            sx={{ 
                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s",
                                marginLeft: "auto"
                            }}
                            aria-label="show more"
                        >
                            <ExpandMore />
                        </IconButton>
                    </Stack>
                )}

            </CardContent>
            
            {/* collapsible section */}
            <Collapse in={expanded}>
                <CardContent>
                    {/* address */}
                    {restaurant.address && ( // && operator for conditional rendering (if address/opening hours are not null/empty)
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationPin fontSize="small" />
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