// src\app\add\page.tsx

"use client"

import { useState } from "react";
import { Container, Typography, Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import RestaurantForm, { RestaurantFormData } from "@/components/RestaurantForm";

export default function AddRestaurantPage() {
  const router = useRouter()
  
  // state for form data (updated by RestaurantForm component)
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: "",
    url: "",
    suburb: null,
    cuisine: null,
    dietaryReqs: [],
    tags: [],
  })
  
  // state for form submission
  const [submitting, setSubmitting] = useState(false)
  
  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        // if success, redirect to home page
        router.push("/")
      } else {
        alert("Failed to add restaurant")
        setSubmitting(false)
      }
    } catch (error) {
      console.error(error)
      alert("Error adding restaurant")
      setSubmitting(false)
    }
  }
  
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Add Restaurant
      </Typography>
      
      <Stack component="form" onSubmit={handleSubmit} spacing={3}>
        {/* reusable form component */}
        <RestaurantForm onChange={setFormData} />
        
        {/* submit button */}
        <Button 
          variant="contained" 
          type="submit"
          disabled={submitting}
          fullWidth
        >
          {submitting ? "Adding..." : "Add Restaurant"}
        </Button>
      </Stack>
    </Container>
  )
}