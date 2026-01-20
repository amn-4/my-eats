// src\components\RestaurantCard.tsx

"use client";

import { Restaurant } from "@/types/restaurant";
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
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
import { ExpandMore, Edit, LocationOn } from "@mui/icons-material";
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
			<Card
				sx={{
					mb: 2,
					borderRadius: 3,
					transition: "all 0.2s ease-in-out",
					border: "1px solid",
					borderColor: "divider",
					"&:hover": {
						transform: "translateY(-2px)",
						boxShadow: 4,
						"& .edit-button": {
							opacity: 1,
						},
					},
				}}
			>
				{/* main card content. clickable to expand/collapse */}
				<CardContent sx={{ p: 2.5 }}>
					{/* restaurant name */}
					<Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography variant="h6" sx={{
									fontWeight: 600,
									lineHeight: 1.3,
									mb: 0.5,
								}}
							>
								{restaurant.name}
							</Typography>
							
							{/* edit button */}
							<IconButton
								className="edit-button"
								size="small"
								onClick={(e) => {
									e.stopPropagation(); // prevent card expand/collapse
									setEditDialogOpen(true) // open edit dialog
								}}
								sx={{
									opacity: 0, // hidden by default
									transition: "opacity 0.2s",
									p: 0.5,
									ml: -0.5,
								}}
							>
								<Edit fontSize="small" />
							</IconButton>
						</Box>

						{/* suburb and cuisine. optional chaining (?.) handles null values */}
						<Typography variant="body2" color="text.secondary">
							{restaurant.suburb?.name} • {restaurant.cuisine?.name}
						</Typography>
					</Box>

					{/* dietary reqs + tags */}
					{(restaurant.dietaryReqs.length > 0 || restaurant.tags.length > 0) && (
						<Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 2 }}>
							{/* dietary reqs chips */}
							{restaurant.dietaryReqs.map((req) => (
								<Chip 
									key={req.id} 
									label={req.name} 
									size="small"
									sx={{
										borderRadius: 2,
										fontWeight: 500,
										fontSize: "0.75rem",
									}}
								/>
							))}
							{/* tag chips - outlined to distinguish from dietary reqs */}
							{restaurant.tags.map((tag) => (
								<Chip
									key={tag.id}
									size="small"
									label={tag.name}
									variant="outlined"
									color="secondary"
									sx={{
										borderRadius: 2,
										fontWeight: 500,
										fontSize: "0.75rem",
									}}
								/>
							))}
						</Box>
					)}

					{/* expand button always at bottom right */}
					<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
						<IconButton
							onClick={handleExpandClick}
							size="small"
							sx={{
								transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 0.3s",
							}}
							aria-label="show more"
						>
							<ExpandMore />
						</IconButton>
					</Box>
				</CardContent>

				{/* collapsible section */}
				<Collapse in={expanded}>
					<CardContent sx={{ pt: 0, px: 2.5, pb: 2.5 }}>
						{/* address with map link */}
						{restaurant.address && (
							<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
								<LocationOn fontSize="small" color="action" sx={{ mt: 0.25 }} />
								<Link
									href={restaurant.googleMapsUrl || "#"}
									target="_blank"
									rel="noopener noreferrer"
									underline="hover"
									variant="body2"
								>
									{restaurant.address}
								</Link>
							</Box>
						)}

						{/* opening hours */}
						{restaurant.openingHours?.weekdayText && (
							<Box sx={{ mb: 2 }}>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 600, mb: 1 }}
								>
									Opening hours
								</Typography>
								{restaurant.openingHours.weekdayText.map((day, index) => (
									<Typography key={index} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
										{day}
									</Typography>
								))}
							</Box>
						)}

						{/* delete button */}
						<Button 
							variant="outlined" 
							color="error" 
							fullWidth
							size="small"
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
