"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function Mode() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="relative cursor-pointer p-2 rounded-full dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 bg-yellow-100  dark:hover:from-gray-700 dark:hover:to-gray-800  "
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-5 w-5 text-gray-200" />
      ) : (
        <Sun className="h-5 w-5 text-orange-600" />
      )}
    </button>
  )
}
