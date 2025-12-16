// src\components\ThemeProvider.tsx

"use client"

import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/app/theme/theme";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  )
}