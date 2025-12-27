// src\components\Navbar.tsx

"use client"

import { AppBar, Toolbar, Typography, Tooltip, IconButton } from "@mui/material"
import ThemeToggle from "@/components/ThemeToggle"
import { Add } from "@mui/icons-material"
import Link from "next/link"

export default function Navbar() {
  return (
    <AppBar position="sticky">
    <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        melb.eats
        </Typography>

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
