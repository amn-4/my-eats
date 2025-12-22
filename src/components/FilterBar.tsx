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
	Typography
} from "@mui/material";
import { FilterAlt } from "@mui/icons-material";

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

	// helper function to render filter controls (used in both desktop and mobile)
	const renderFilters = () => (
		<>
			<FormControl sx={{ minWidth: 200 }}>
				<InputLabel>Suburb</InputLabel>
				<Select
					value={selectedSuburb}
					label="Suburb"
					onChange={(e) => setSelectedSuburb(e.target.value)}
				>
					<MenuItem value="">All suburbs</MenuItem>
					{suburbs.map((suburb) => (
						<MenuItem key={suburb.id} value={suburb.id}>
							{suburb.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControl sx={{ minWidth: 200 }}>
				<InputLabel>Cuisine</InputLabel>
				<Select
					value={selectedCuisine}
					label="Cuisine"
					onChange={(e) => setSelectedCuisine(e.target.value)}
				>
					<MenuItem value="">All cuisines</MenuItem>
					{cuisines.map((cuisine) => (
						<MenuItem key={cuisine.id} value={cuisine.id}>
							{cuisine.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControl sx={{ minWidth: 200 }}>
				<InputLabel>Dietary Requirements</InputLabel>
				<Select
					value={selectedDietary}
					label="Dietary requirement"
					onChange={(e) => setSelectedDietary(e.target.value)}
				>
					<MenuItem value="">All dietary requirements</MenuItem>
					{dietaryReqs.map((req) => (
						<MenuItem key={req.id} value={req.id}>
							{req.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControl sx={{ minWidth: 200 }}>
				<InputLabel>Tags</InputLabel>
				<Select
					value={selectedTag}
					label="Tag"
					onChange={(e) => setSelectedTag(e.target.value)}
				>
					<MenuItem value="">All tags</MenuItem>
					{tags.map((tag) => (
						<MenuItem key={tag.id} value={tag.id}>
							{tag.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControlLabel
				control={
					<Switch
						checked={openNow}
						onChange={(e) => setOpenNow(e.target.checked)}
					/>
				}
				label="Open Now"
			/>
		</>
	)

  return (
    <>
      {/* desktop filters, hidden on mobile (xs) but visible on desktop (md+) */}
			<Stack direction="row" spacing={2} sx={{ mb: 3, display: { xs: "none", md: "flex" } }}>
				{renderFilters()}
			</Stack>

      {/* mobile filter button, visible on mobile (xs-sm), hidden on desktop (md+) */}
      <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
				<Button 
					variant="outlined" 
					onClick={() => setDrawerOpen(true)}
					startIcon={<FilterAlt />}
					fullWidth
				>
					Filters
				</Button>
			</Box>

			{/* mobile filter drawer */}
			<Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
				<Box sx={{ p: 3 }}>
					<Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
					<Stack spacing={2}>
						{renderFilters()}
						<Button variant="contained" onClick={() => setDrawerOpen(false)}>
							Apply Filters
						</Button>
					</Stack>
				</Box>
			</Drawer>
    </>
  );
}