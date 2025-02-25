"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // After mounting, we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])
  React.useEffect(() => {
    setIsDarkMode(theme === "dark")
  }, [theme])

  const handleChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }


  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-amber-500" />
        <Label htmlFor="theme-toggle" className="cursor-pointer">
          {theme === "dark" ? "Dark" : "Light"} Mode
        </Label>
      </div>
      <Switch 
        id="theme-toggle" 
        checked={isDarkMode}
        onCheckedChange={handleChange}
      />
    </div>
  )
} 