// src\components\Navbar.tsx

"use client"

import { AppBar, Toolbar, Typography, Tooltip, IconButton, Box, Button } from "@mui/material";
import ThemeToggle from "@/components/ThemeToggle";
import { Add } from "@mui/icons-material";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(10px)", // glassmorphism blur effect
        backgroundColor: "rgba(var(--mui-palette-background-defaultChannel) / 0.8)", // semi-transparent
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
    <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
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
            MyEats
          </Typography>
        </Box>

        {/* add restaurant button */}
        <Tooltip title="Add Restaurant">
          <IconButton
            component={Link}
            href="/add"
            color="inherit"
            sx={{ mr: 1.5 }}
            aria-label="add restaurant"
          >
            <Add />
          </IconButton>
        </Tooltip>

        <ThemeToggle />

        {/* clerk auth buttons */}
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ 
                ml: 2,
                borderRadius: 2,
              }}
            >
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Box sx={{ ml: 2 }}>
            <UserButton />
          </Box>
        </SignedIn>
        
    </Toolbar>
    </AppBar>
  )
}
