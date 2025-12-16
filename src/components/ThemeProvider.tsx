// src\components\ThemeProvider.tsx

"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { getTheme } from "@/app/theme/theme"

// define what data the context will hold
type ThemeContextType = {
  mode: "light" | "dark"
  toggleTheme: () => void
}

// create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// create provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  // create state for mode with initial value from localStorage
  const [mode, setMode] = useState<"light" | "dark">(() => {
    // this function only runs once on initial render
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-mode")
      if (saved === "light" || saved === "dark") {
        return saved
      }
    }
    return "light" // default fallback
  })

  // save to localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem("theme-mode", mode)
  }, [mode])

  // create toggle function
  const toggleTheme = () => {
    setMode(prevMode => prevMode === "light" ? "dark" : "light")
  }

  // get theme using getTheme function
  const theme = getTheme(mode)

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  )
}

// create hook to use the context easily
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}