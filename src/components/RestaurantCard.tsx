// src\components\RestaurantCard.tsx

"use client";

import { Restaurant } from "@/types/restaurant";
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
  Collapse,
	Button
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { ExpandMore } from "@mui/icons-material";
import { Edit } from "@mui/icons-material";
import { LocationPin } from "@mui/icons-material";
import Link from "@mui/material/Link";
import RestaurantForm, { RestaurantFormData } from "./RestaurantForm";

export default function RestaurantCard({
  restaurant,
	onDeleted,
}: {
  restaurant: Restaurant;
	onDeleted: (id: string) => void;
}) {
  // useState to track if card is expanded (true) or collapsed (false)
  const [expanded, setExpanded] = useState(false);

	// state for delete confirmation dialog visibility
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false) // false = closed

	// state for edit dialog visibility
	const [editDialogOpen, setEditDialogOpen] = useState(false)

	// state for edit form data
	const [editFormData, setEditFormData] = useState<RestaurantFormData>({
		name: restaurant.name,
		url: restaurant.url || "",
		suburb: restaurant.suburb?.name || null,
		cuisine: restaurant.cuisine?.name || null,
		dietaryReqs: restaurant.dietaryReqs.map(r => r.name),
		tags: restaurant.tags.map(t => t.name),
	})

  // toggle function: flips expanded state (true -> false or false -> true)
  const handleExpandClick = () => setExpanded(!expanded);

	// handle restaurant deletion
	const handleDelete = async () => {
		try {
			const response = await fetch(`/api/restaurants/${restaurant.id}`, {
				method: "DELETE"
			})
			
			if (response.ok) {
				setDeleteDialogOpen(false) // close dialog
				onDeleted(restaurant.id) // notify parent to remove from list
				alert("Restaurant deleted!")
			} else {
				alert("Failed to delete restaurant")
			}
		} catch (error) {
			console.error(error)
			alert("Error deleting restaurant")
		}
	}

	// handle restaurant edit
	const handleEdit = async () => {
		try {
			// transform form data to match backend API format
			const payload = {
				name: editFormData.name,
				url: editFormData.url,
				suburbId: editFormData.suburb,  // backend expects "suburbId" not "suburb"
				cuisineId: editFormData.cuisine, // etc
				dietaryReqIds: editFormData.dietaryReqs,
				tagIds: editFormData.tags,
			}
			
			const response = await fetch(`/api/restaurants/${restaurant.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})
			
			if (response.ok) {
				setEditDialogOpen(false) // close dialog
				alert("Restaurant updated!")
				window.location.reload() // reload to show changes
			} else {
				alert("Failed to update restaurant")
			}
		} catch (error) {
			console.error(error)
			alert("Error updating restaurant")
		}
	}

  return (
		<>
			<Card sx={{ mb: 2 }}>
				{/* main card content. clickable to expand/collapse */}
				<CardContent>
					{/* restaurant name */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Typography variant="h5" sx={{ color: "text.primary" }}>
							{restaurant.name}
						</Typography>

						{/* edit button */}
							<IconButton
								size="small"
								onClick={(e) => {
									e.stopPropagation(); // prevent card expand/collapse
									setEditDialogOpen(true) // open edit dialog
								}}
							>
								<Edit fontSize="small" />
							</IconButton>
						</Box>

					{/* suburb and cuisine. optional chaining (?.) handles null values */}
					<Typography variant="body2" color="text.secondary">
						{restaurant.suburb?.name} • {restaurant.cuisine?.name}
					</Typography>

					{/* dietary reqs */}
					{restaurant.tags.length > 0 ? (
						// if restaurant has tags, dietary reqs without expandable button to the right
						<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
							{restaurant.dietaryReqs.map((req) => (
								<Chip key={req.id} label={req.name} />
							))}
						</Stack>
					) : (
						// if no tags, dietary reqs with button on right
						<Stack
							direction="row"
							spacing={1}
							sx={{ mt: 2, alignItems: "center" }}
						>
							<Box
								sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexGrow: 1 }}
							>
								{restaurant.dietaryReqs.map((req) => (
									<Chip key={req.id} label={req.name} />
								))}
							</Box>
							<IconButton
								onClick={handleExpandClick}
								sx={{
									transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
									transition: "transform 0.3s",
									marginLeft: "auto",
								}}
								aria-label="show more"
							>
								<ExpandMore />
							</IconButton>
						</Stack>
					)}

					{/* tags row with expand button, if tags exist */}
					{restaurant.tags.length > 0 && (
						<Stack
							direction="row"
							spacing={1}
							sx={{ mt: 1, alignItems: "center" }}
						>
							{/* tags on left */}
							<Box
								sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexGrow: 1 }}
							>
								{restaurant.tags.map((tag) => (
									<Chip
										key={tag.id}
										size="small"
										label={tag.name}
										color="secondary"
									/>
								))}
							</Box>
							{/* expand button on the right */}
							<IconButton
								onClick={handleExpandClick}
								sx={{
									transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
									transition: "transform 0.3s",
									marginLeft: "auto",
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
							<Typography
								variant="body2"
								sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
							>
								<LocationPin fontSize="small" />
								<Link
									href={restaurant.googleMapsUrl || "#"}
									target="_blank"
									rel="noopener noreferrer"
									underline="hover"
								>
									{restaurant.address}
								</Link>
							</Typography>
						)}

						{/* opening hours */}
						{restaurant.openingHours?.weekdayText && (
							<>
								<Typography
									variant="subtitle2"
									sx={{ mt: 2, fontWeight: "bold" }}
								>
									Opening hours:
								</Typography>
								{restaurant.openingHours.weekdayText.map((day, index) => (
									<Typography key={index} variant="body2">
										{day}
									</Typography>
								))}
							</>
						)}
						<Button 
							variant="outlined" 
							color="error" 
							fullWidth
							sx={{ mt: 2 }}
							onClick={(e) => {
								e.stopPropagation()
								setDeleteDialogOpen(true)
							}}
						>
							Delete Restaurant
						</Button>
					</CardContent>
				</Collapse>
			</Card>
			{/* delete confirmation dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Delete Restaurant</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete {restaurant.name}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* edit restaurant dialog */}
			<Dialog 
				open={editDialogOpen} 
				onClose={() => setEditDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Edit Restaurant</DialogTitle>
				<DialogContent>
					{/* form component with initial data */}
					<RestaurantForm initialData={editFormData} onChange={setEditFormData} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleEdit}>Save</Button>
				</DialogActions>
			</Dialog>
		</>
  );
}
