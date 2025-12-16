// src\app\layout.tsx

import { Inconsolata } from "next/font/google";
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/ThemeProvider";

// heading font
const inconsolata = Inconsolata({ 
  subsets: ["latin"],
  variable: "--font-inconsolata",
})

// body font
const lineSeed = localFont({
  src: [
    {
      path: "../../public/fonts/lineSeed/LINESeedSans_W_Th.woff2",
      weight: "250",
    },
    {
      path: "../../public/fonts/lineSeed/LINESeedSans_W_Rg.woff2",
      weight: "400",
    },
    {
      path: "../../public/fonts/lineSeed/LINESeedSans_W_Bd.woff2",
      weight: "700",
    },
    {
      path: "../../public/fonts/lineSeed/LINESeedSans_W_XBd.woff2",
      weight: "800",
    },
    {
      path: "../../public/fonts/lineSeed/LINESeedSans_W_He.woff2",
      weight: "900",
    },
  ],
  variable: "--font-line-seed",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inconsolata.variable} ${lineSeed.variable}`}>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
