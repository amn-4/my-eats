// src\app\theme\theme.ts

import { createTheme } from "@mui/material"

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class"
  },
  colorSchemes: {
    light: {
      palette: {
        // default light mode colours
      },
    },
    dark: {
      palette: {
        // default dark mode colours
      },
    },
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