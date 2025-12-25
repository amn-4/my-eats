// src\components\RestaurantForm.tsx

"use client"

import { useState, useEffect } from "react"
import { Stack, TextField, Autocomplete } from "@mui/material"

// types for autocomplete options
type Suburb = { id: string; name: string }
type Cuisine = { id: string; name: string }
type DietaryReq = { id: string; name: string }
type Tag = { id: string; name: string }

// type for the form data
export type RestaurantFormData = {
  name: string
  url: string
  suburb: string | null
  cuisine: string | null
  dietaryReqs: string[]
  tags: string[]
}

type RestaurantFormProps = {
  // initial data to populate form (undefined for new restaurant, populated for edit)
  initialData?: RestaurantFormData
  // callback when form values change
  onChange: (data: RestaurantFormData) => void
}

export default function RestaurantForm({ initialData, onChange }: RestaurantFormProps) {
  // state for autocomplete options (fetched from API)
  const [suburbs, setSuburbs] = useState<Suburb[]>([])
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [dietaryReqs, setDietaryReqs] = useState<DietaryReq[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  
  // state for form values
  const [name, setName] = useState(initialData?.name || "")
  const [url, setUrl] = useState(initialData?.url || "")
  const [selectedSuburb, setSelectedSuburb] = useState<Suburb | string | null>(initialData?.suburb || null)
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | string | null>(initialData?.cuisine || null)
  const [selectedDietaryReqs, setSelectedDietaryReqs] = useState<(DietaryReq | string)[]>(initialData?.dietaryReqs || [])
  const [selectedTags, setSelectedTags] = useState<(Tag | string)[]>(initialData?.tags || [])
  
  // fetch autocomplete options on mount
  useEffect(() => {
    fetch("/api/suburbs").then(res => res.json()).then(data => setSuburbs(data))
    fetch("/api/cuisines").then(res => res.json()).then(data => setCuisines(data))
    fetch("/api/dietary-reqs").then(res => res.json()).then(data => setDietaryReqs(data))
    fetch("/api/tags").then(res => res.json()).then(data => setTags(data))
  }, [])
  
  // notify parent whenever form values change
  useEffect(() => {
    onChange({
      name,
      url,
      suburb: typeof selectedSuburb === "string" ? selectedSuburb : selectedSuburb?.name || null,
      cuisine: typeof selectedCuisine === "string" ? selectedCuisine : selectedCuisine?.name || null,
      dietaryReqs: selectedDietaryReqs.map(item => typeof item === "string" ? item : item.name),
      tags: selectedTags.map(item => typeof item === "string" ? item : item.name),
    })
  }, [name, url, selectedSuburb, selectedCuisine, selectedDietaryReqs, selectedTags, onChange])
  
  return (
    <Stack spacing={3}>
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
      
      {/* suburb autocomplete - type to search, can add new */}
      <Autocomplete
        freeSolo
        options={suburbs}
        getOptionLabel={(option) => typeof option === "string" ? option : option.name}
        value={selectedSuburb}
        onChange={(e, value) => setSelectedSuburb(value)}
        renderInput={(params) => <TextField {...params} label="Suburb" />}
      />
      
      {/* cuisine autocomplete - type to search, can add new */}
      <Autocomplete
        freeSolo
        options={cuisines}
        getOptionLabel={(option) => typeof option === "string" ? option : option.name}
        value={selectedCuisine}
        onChange={(e, value) => setSelectedCuisine(value)}
        renderInput={(params) => <TextField {...params} label="Cuisine" />}
      />
      
      {/* dietary requirements - multiple select, can add new */}
      <Autocomplete
        multiple
        freeSolo
        options={dietaryReqs}
        getOptionLabel={(option) => typeof option === "string" ? option : option.name}
        value={selectedDietaryReqs}
        onChange={(e, value) => setSelectedDietaryReqs(value)}
        renderInput={(params) => <TextField {...params} label="Dietary Requirements" />}
      />
      
      {/* tags - multiple select, can add new */}
      <Autocomplete
        multiple
        freeSolo
        options={tags}
        getOptionLabel={(option) => typeof option === "string" ? option : option.name}
        value={selectedTags}
        onChange={(e, value) => setSelectedTags(value)}
        renderInput={(params) => <TextField {...params} label="Tags" />}
      />
    </Stack>
  )
}