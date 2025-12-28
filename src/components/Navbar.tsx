// src\components\Navbar.tsx

"use client"

import { AppBar, Toolbar, Typography, Tooltip, IconButton, Box } from "@mui/material"
import ThemeToggle from "@/components/ThemeToggle"
import { Add } from "@mui/icons-material"
import Link from "next/link"

export default function Navbar() {
  return (
    <AppBar position="sticky">
    <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant="h6" 
            component={Link}
            href="/"
            sx={{ 
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              position: "relative",
              display: "inline-block",
              transition: "all 0.3s ease",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -2,
                left: 0,
                width: 0,
                height: 2,
                backgroundColor: "currentColor",
                transition: "width 0.5s ease",
              },
              "&:hover::after": {
                width: "100%",
              }
            }}
          >
            melb.eats
          </Typography>
        </Box>

        {/* add restaurant button */}
        <Tooltip title="Add Restaurant">
          <IconButton
            component={Link}
            href="/add"
            color="inherit"
            sx={{ mr: 2 }}
            aria-label="add restaurant"
          >
            <Add />
          </IconButton>
        </Tooltip>

        <ThemeToggle />
    </Toolbar>
    </AppBar>
  )
}
