"use client"

import { useLocale } from "next-intl"
import { Check, ChevronDown } from "lucide-react"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { cn, locales } from "@/lib/utils"
import { setUserLocale } from "@/lib/service"

const localeNames = {
  en: "English",
  pt: "Português", 
  fr: "Français",
}

export default function LocaleSwitcher({
  selectClassName,
  className,
  showLabel = false,
}: {
  selectClassName?: string
  className?: string
  showLabel?: boolean
}) {
  const locale = useLocale()

  function onChange(value: string) {
    setUserLocale(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={locale}
          className={cn(
            "flex items-center gap-2 cursor-pointer focus:border-gray-700 dark:focus:border-gray-300 rounded-lg px-3 py-2 bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all",
            className,
          )}
        >
          <Image
            src={`/flags/${locale}.svg`}
            alt={locale}
            width={20}
            height={20}
            className="rounded-full object-contain"
          />
          {showLabel && <span className="text-gray-700 dark:text-gray-300 uppercase font-medium">{locale}</span>}
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-white/20 dark:border-gray-700/20", selectClassName)}>
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => onChange(item)}
            className={cn(
              "flex items-center cursor-pointer gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-gray-100",
              item === locale && "bg-blue-500 dark:bg-blue-600 text-white font-medium hover:bg-blue-600 dark:hover:bg-blue-700",
            )}
          >
            <Image src={`/flags/${item}.svg`} alt={item} width={20} height={20} className="rounded-full object-contain" />
            <span className="flex-1">{localeNames[item as keyof typeof localeNames]}</span>
            {item === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}