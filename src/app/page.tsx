// src\app\page.tsx

"use client"
import { Container, Typography, Stack } from "@mui/material"

export default function HomePage() {
  
  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h3">title</Typography>
      </Stack>
    </Container>
  )
}
