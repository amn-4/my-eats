// src\components\FilterBar.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  Box,
  Switch,
  FormControlLabel,
  Button,
  Drawer,
	Typography,
	Autocomplete,
	TextField
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
  suburbIds: string[];
  cuisineIds: string[];
  dietaryReqIds: string[];
  tagIds: string[];
  openNow: boolean;
	search: string;
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

  // state for selected filters (arrays for multi-select)
	const [selectedSuburbs, setSelectedSuburbs] = useState<(Suburb | string)[]>([])
	const [selectedCuisines, setSelectedCuisines] = useState<(Cuisine | string)[]>([])
	const [selectedDietaryReqs, setSelectedDietaryReqs] = useState<(DietaryReq | string)[]>([])
	const [selectedTags, setSelectedTags] = useState<(Tag | string)[]>([])
	const [openNow, setOpenNow] = useState(false)

	// state for searching restaurants
	const [searchQuery, setSearchQuery] = useState("")

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
			suburbIds: selectedSuburbs.map(item => typeof item === "string" ? item : item.id),
			cuisineIds: selectedCuisines.map(item => typeof item === "string" ? item : item.id),
			dietaryReqIds: selectedDietaryReqs.map(item => typeof item === "string" ? item : item.id),
			tagIds: selectedTags.map(item => typeof item === "string" ? item : item.id),
			openNow: openNow,
			search: searchQuery,
		})
	}, [selectedSuburbs, selectedCuisines, selectedDietaryReqs, selectedTags, openNow, searchQuery, onFiltersChange])

	// helper function to render filter controls (used in both desktop and mobile)
	const renderFilters = () => (
		<>
			{/* search by name */}
			<TextField
				label="Search by name"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				sx={{ minWidth: 200 }}
				placeholder="Restaurant name..."
			/>

			{/* suburb filter - multi-select */}
			<Autocomplete
				multiple
				freeSolo
				options={suburbs}
				getOptionLabel={(option) => typeof option === "string" ? option : option.name}
				value={selectedSuburbs}
				onChange={(e, value) => setSelectedSuburbs(value)}
				renderInput={(params) => <TextField {...params} label="Suburbs" />}
				sx={{ minWidth: 200 }}
			/>
			
			{/* cuisine filter - multi-select */}
			<Autocomplete
				multiple
				freeSolo
				options={cuisines}
				getOptionLabel={(option) => typeof option === "string" ? option : option.name}
				value={selectedCuisines}
				onChange={(e, value) => setSelectedCuisines(value)}
				renderInput={(params) => <TextField {...params} label="Cuisines" />}
				sx={{ minWidth: 200 }}
			/>
			
			{/* dietary reqs filter - multi-select */}
			<Autocomplete
				multiple
				freeSolo
				options={dietaryReqs}
				getOptionLabel={(option) => typeof option === "string" ? option : option.name}
				value={selectedDietaryReqs}
				onChange={(e, value) => setSelectedDietaryReqs(value)}
				renderInput={(params) => <TextField {...params} label="Dietary Requirements" />}
				sx={{ minWidth: 200 }}
			/>
			
			{/* tags filter - multi-select */}
			<Autocomplete
				multiple
				freeSolo
				options={tags}
				getOptionLabel={(option) => typeof option === "string" ? option : option.name}
				value={selectedTags}
				onChange={(e, value) => setSelectedTags(value)}
				renderInput={(params) => <TextField {...params} label="Tags" />}
				sx={{ minWidth: 200 }}
			/>
			
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