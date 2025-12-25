"use client"

import { useState, useEffect } from "react";
import { Container, Typography, TextField, Button, Stack, Autocomplete } from "@mui/material";
import { useRouter } from "next/navigation";

// types for autocomplete options
type Suburb = { id: string; name: string }
type Cuisine = { id: string; name: string }
type DietaryReq = { id: string; name: string }
type Tag = { id: string; name: string }

export default function AddRestaurantPage() {
  const router = useRouter()
  
  // state for autocomplete options (fetched from API)
  const [suburbs, setSuburbs] = useState<Suburb[]>([])
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [dietaryReqs, setDietaryReqs] = useState<DietaryReq[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  
  // state for form values
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [selectedSuburb, setSelectedSuburb] = useState<Suburb | string | null>(null)
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | string | null>(null)
  const [selectedDietaryReqs, setSelectedDietaryReqs] = useState<(DietaryReq | string)[]>([])
  const [selectedTags, setSelectedTags] = useState<(Tag | string)[]>([])
  
  // state for form submission
  const [submitting, setSubmitting] = useState(false)
  
  // fetch autocomplete options on mount
  useEffect(() => {
    fetch("/api/suburbs").then(res => res.json()).then(data => setSuburbs(data))
    fetch("/api/cuisines").then(res => res.json()).then(data => setCuisines(data))
    fetch("/api/dietary-reqs").then(res => res.json()).then(data => setDietaryReqs(data))
    fetch("/api/tags").then(res => res.json()).then(data => setTags(data))
  }, [])
  
  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // prepare data for API
    const data = {
      name,
      url,
      suburb: typeof selectedSuburb === "string" ? selectedSuburb : selectedSuburb?.name,
      cuisine: typeof selectedCuisine === "string" ? selectedCuisine : selectedCuisine?.name,
      dietaryReqs: selectedDietaryReqs.map(item => 
        typeof item === "string" ? item : item.name
      ),
      tags: selectedTags.map(item => 
        typeof item === "string" ? item : item.name
      ),
    }
    
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        // success, then redirect to home page
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
        {/* restaurant name */}
        <TextField
          label="Restaurant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        
        {/* source url */}
        <TextField
          label="Instagram/TikTok URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          placeholder="https://instagram.com/..."
        />
        
        {/* suburb */}
        <Autocomplete
          freeSolo
          options={suburbs}
          getOptionLabel={(option) => typeof option === "string" ? option : option.name}
          value={selectedSuburb}
          onChange={(e, value) => setSelectedSuburb(value)}
          renderInput={(params) => <TextField {...params} label="Suburb" />}
        />
        
        {/* cuisine */}
        <Autocomplete
          freeSolo
          options={cuisines}
          getOptionLabel={(option) => typeof option === "string" ? option : option.name}
          value={selectedCuisine}
          onChange={(e, value) => setSelectedCuisine(value)}
          renderInput={(params) => <TextField {...params} label="Cuisine" />}
        />
        
        {/* dietary requirements */}
        <Autocomplete
          multiple
          freeSolo
          options={dietaryReqs}
          getOptionLabel={(option) => typeof option === "string" ? option : option.name}
          value={selectedDietaryReqs}
          onChange={(e, value) => setSelectedDietaryReqs(value)}
          renderInput={(params) => <TextField {...params} label="Dietary Requirements" />}
        />
        
        {/* tags */}
        <Autocomplete
          multiple
          freeSolo
          options={tags}
          getOptionLabel={(option) => typeof option === "string" ? option : option.name}
          value={selectedTags}
          onChange={(e, value) => setSelectedTags(value)}
          renderInput={(params) => <TextField {...params} label="Tags" />}
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
  )
}