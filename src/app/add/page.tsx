// src\app\add\page.tsx

"use client"

import { useState } from "react";
import { Container, Typography, Button, Stack } from "@mui/material";
import RestaurantForm, { RestaurantFormData } from "@/components/RestaurantForm";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function AddRestaurantPage() {
  
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

  const [resetCounter, setResetCounter] = useState(0)
  
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
        // if success, reset form and show message
        setFormData({
          name: "",
          url: "",
          suburb: null,
          cuisine: null,
          dietaryReqs: [],
          tags: [],
        })
        setResetCounter(prev => prev + 1)
        setSubmitting(false)
        alert("Restaurant added successfully!")
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
    <>
      <SignedIn>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Typography variant="h3" sx={{ mb: 4 }}>
            Add Restaurant
          </Typography>
          
          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            {/* reusable form component */}
            <RestaurantForm 
              initialData={formData}
              onChange={setFormData} 
              key={resetCounter}
            />
            
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
      </SignedIn>

      <SignedOut>
        <Container sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Sign in to add restaurants
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