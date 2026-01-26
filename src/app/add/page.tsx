// src\app\add\page.tsx

"use client"

import { useState } from "react";
import { Container, Typography, Button, Stack, Card, CardContent, Snackbar, Alert } from "@mui/material";
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

  // snackbar state for success/error messages
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({
    open: false,
    message: "",
    severity: "success"
  })
  
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
        setSnackbar({
          open: true,
          message: "Restaurant added successfully!", 
          severity: "success" 
        })
      } else {
        setSnackbar({
          open: true,
          message: "Failed to add restaurant",
          severity: "error"
        })
        setSubmitting(false)
      }
    } catch (error) {
      console.error(error)
      setSnackbar({
        open: true,
        message: "Error adding restaurant",
        severity: "error"
      })
      setSubmitting(false)
    }
  }
  
  return (
    <>
      <SignedIn>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          {/* page title */}
            <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
              Add Restaurant
            </Typography>
          
          {/* form card */}
          <Card 
            sx={{ 
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <CardContent sx={{ p: 3 }}>
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
                  size="large"
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {submitting ? "Adding..." : "Add Restaurant"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
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
      {/* success/error snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={(_event, reason) => {
          if (reason === "clickaway") return
          setSnackbar(prev => ({ ...prev, open: false }))
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}