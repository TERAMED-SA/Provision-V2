"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/ui/components/ui/dropdown-menu"

import {  Moon, Sun, SunMoon } from "lucide-react"

export function Mode() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const renderIcon = () => {
    if (!mounted) return <SunMoon className="h-5 w-5" />
    if (resolvedTheme === "dark") return <Moon className="h-5 w-5" />
    if (resolvedTheme === "light") return <Sun className="h-5 w-5" />
    return <SunMoon className="h-5 w-5" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer  p-2 hover:bg-muted rounded-full transition-colors">
          {renderIcon()}
      
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-30 rounded-lg shadow-xl" align="center" sideOffset={4}>
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
          <Sun className="mr-2 h-5 w-5" /> Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
          <Moon className="mr-2 h-5 w-5" /> Escuro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
