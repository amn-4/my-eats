// src\components\FilterBar.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Drawer,
} from "@mui/material";

// type definitions for filter options fetched from api
type Suburb = {
  id: string;
  name: string;
};

type Cuisine = {
  id: string;
  name: string;
};

type DietaryReq = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
};

type FilterValues = {
  suburbId: string;
  cuisineId: string;
  dietaryReqId: string;
  tagId: string;
  openNow: boolean;
};

export default function FilterBar({
  onFiltersChange,
}: {
  onFiltersChange: (filters: FilterValues) => void;
}) {
  // state for filter options
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [dietaryReqs, setDietaryReqs] = useState<DietaryReq[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // state for mobile drawer visibility
  const [drawerOpen, setDrawerOpen] = useState(false);

  // state for selected filter values (what user chooses from dropdowns)
  // empty string means "all" (no filter applied)
  const [selectedSuburb, setSelectedSuburb] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedDietary, setSelectedDietary] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [openNow, setOpenNow] = useState(false);

  // fetch filter options from api when component loads
  useEffect(() => {
    // fetch all suburbs to populate suburb dropdown selection
    fetch("/api/suburbs")
      .then((res) => res.json())
      .then((data) => setSuburbs(data));
    // fetch cuisines
    fetch("/api/cuisines")
      .then((res) => res.json())
      .then((data) => setCuisines(data));
    // fetch dietary reqs
    fetch("/api/dietary-reqs")
      .then((res) => res.json())
      .then((data) => setDietaryReqs(data));
    // fetch tags
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTags(data));
  }, []);

  // notify parent component whenever any filter changes
  useEffect(() => {
    onFiltersChange({
      suburbId: selectedSuburb,
      cuisineId: selectedCuisine,
      dietaryReqId: selectedDietary,
      tagId: selectedTag,
      openNow: openNow,
    });
  }, [
    selectedSuburb,
    selectedCuisine,
    selectedDietary,
    selectedTag,
    openNow,
    onFiltersChange,
  ]);

  return (
    <>
      {/* desktop filters, hidden on mobile (xs) but visible on desktop (md+) */}

      {/* suburb filter dropdown */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, display: { xs: "none", md: "flex" } }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Suburb</InputLabel>
          <Select
            value={selectedSuburb}
            label="Suburb"
            onChange={(e) => setSelectedSuburb(e.target.value)}
          >
            <MenuItem value="">All Suburbs</MenuItem>
            {suburbs.map((suburb) => (
              <MenuItem key={suburb.id} value={suburb.id}>
                {suburb.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* cuisine filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Cuisine</InputLabel>
          <Select
            value={selectedCuisine}
            label="Cuisine"
            onChange={(e) => setSelectedCuisine(e.target.value)}
          >
            <MenuItem value="">All Cuisines</MenuItem>
            {cuisines.map((cuisines) => (
              <MenuItem key={cuisines.id} value={cuisines.id}>
                {cuisines.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* dietary reqs filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Dietary requirements</InputLabel>
          <Select
            value={selectedDietary}
            label="Dietary requirement"
            onChange={(e) => setSelectedDietary(e.target.value)}
          >
            <MenuItem value="">All dietary requirements</MenuItem>
            {dietaryReqs.map((dietaryReqs) => (
              <MenuItem key={dietaryReqs.id} value={dietaryReqs.id}>
                {dietaryReqs.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* tags filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tags</InputLabel>
          <Select
            value={selectedTag}
            label="Tag"
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <MenuItem value="">All tags</MenuItem>
            {tags.map((tags) => (
              <MenuItem key={tags.id} value={tags.id}>
                {tags.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* "open now" switch */}
        <FormControlLabel
          control={
            <Switch
              checked={openNow}
              onChange={(e) => setOpenNow(e.target.checked)}
            />
          }
          label="Open Now"
        />
      </Stack>

      {/* mobile filters. will implement filter button and drawer */}
      <Box>{/* ... */}</Box>
      <Drawer>{/* ... */}</Drawer>
    </>
  );
}