// src\components\Navbar.tsx

"use client"

import { AppBar, Toolbar, Typography } from "@mui/material"
import ThemeToggle from "@/components/ThemeToggle"

export default function Navbar() {
  return (
    <AppBar position="sticky">
    <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        melb.eats
        </Typography>
        <ThemeToggle />
    </Toolbar>
    </AppBar>
  )
}
