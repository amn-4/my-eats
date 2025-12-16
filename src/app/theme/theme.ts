// src\app\theme\theme.ts

import { createTheme } from "@mui/material"

export const getTheme = (mode: "light" | "dark") => {
  return createTheme({
    palette: {
      mode,
    },
    typography: {
      fontFamily: "var(--font-line-seed)",
      h1: { fontFamily: "var(--font-inconsolata)" },
      h2: { fontFamily: "var(--font-inconsolata)" },
      h3: { fontFamily: "var(--font-inconsolata)" },
      h4: { fontFamily: "var(--font-inconsolata)" },
      h5: { fontFamily: "var(--font-inconsolata)" },
      h6: { fontFamily: "var(--font-inconsolata)" },
    },
  })
}