"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  Home,
  MapPin,
  MessageSquare,
  Building2,
  BarChart3,
  Shield,
  Settings,
  ChevronDown,
  User,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Sheet, SheetContent } from "../ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { useSupervisionStore } from "@/hooks/useDataStore"
import { useSupervisionData } from "@/hooks/useDataQueries"

interface SidebarProps {
  className?: string
  collapsed?: boolean
  isMobile?: boolean
  isSheetOpen?: boolean
  setIsSheetOpen?: (open: boolean) => void
}

interface MenuItem {
  icon: any
  label: string
  href?: string
  items?: {
    title: string
    href: string
    icon?: any
  }[]
  badge?: string | number
}

export function Sidebar({
  className,
  collapsed = false,
  isMobile = false,
  isSheetOpen = false,
  setIsSheetOpen,
}: SidebarProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const t = useTranslations("Sidebar")

  const isVisuallyExpanded = !collapsed || (collapsed && isHovered)

  const toggleItem = (label: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const handleMouseEnter = () => {
    if (collapsed) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        setHoverTimeout(null)
      }
      const timeout = setTimeout(() => {
        setIsHovered(true)
      }, 150)
      setHoverTimeout(timeout)
    }
  }

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }

    if (collapsed && isHovered) {
      const timeout = setTimeout(() => {
        setIsHovered(false)
        setOpenItems({})
      }, 300)
      setHoverTimeout(timeout)
    }
  }

  const { getSelectedDateCounts } = useSupervisionStore()
  useSupervisionData()
  const counts = getSelectedDateCounts()

  const menuSections = [
    {
      title: t("Atividades"),
      items: [
        { icon: Home, label: t("Dashboard"), href: "/dashboard" },
        { icon: Shield, label: t("Supervisao"), href: "/dashboard/supervisao", badge: counts.supervision },
        { icon: AlertTriangle, label: t("Ocorrencias"), href: "/dashboard/ocorrencias", badge: counts.occurrence },
      ],
    },
    {
      title: t("Servicos"),
      items: [
        { icon: MapPin, label: t("Mapa"), href: "/dashboard/mapa" },
        { icon: MessageSquare, label: t("Chat"), href: "/dashboard/chat" },
      ],
    },
    {
      title: t("Relatorio"),
      items: [{ icon: BarChart3, label: t("Analytics"), href: "/dashboard/analytics" }],
    },
    {
      title: t("Configuracoes"),
      items: [
        {
          icon: Settings,
          label: t("Configuracoes"),
          items: [
            { title: t("Clientes"), href: "/dashboard/configuracoes/clientes", icon: Building2 },
            { title: t("Perfil"), href: "/dashboard/configuracoes/perfil", icon: User },
          ],
        },
      ],
    },
  ]

  const renderCollapsedMenuItem = (item: MenuItem, index: number) => {
    const isActive = pathname === item.href
    const hasSubItems = item.items && item.items.length > 0

    if (hasSubItems) {
      return (
        <div key={index}>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 bg-transparent border-0 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 data-[state=open]:bg-gray-100/50 dark:data-[state=open]:bg-gray-800/50 p-0",
                    isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  <item.icon size={20} />
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={cn(
                    "min-w-[200px] p-2 ml-2 rounded-lg shadow-lg",
                    isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200",
                  )}
                >
                  <div className="space-y-1">
                    {item.items?.map((subItem, subIndex) => (
                      <NavigationMenuLink key={subIndex} asChild>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                            pathname === subItem.href
                              ? isDarkMode
                                ? "bg-blue-600/20 text-blue-300 border-l-2 border-blue-500"
                                : "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                              : isDarkMode
                                ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                                : "text-gray-700 hover:bg-gray-100/50 hover:text-gray-900",
                          )}
                          onClick={() => {
                            if (isMobile && setIsSheetOpen) {
                              setIsSheetOpen(false)
                            }
                          }}
                        >
                          {subItem.icon && <subItem.icon size={16} className="mr-2" />}
                          <span>{subItem.title}</span>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )
    }

    return (
      <div key={index} className="mb-1">
        <Link
          href={item.href || "#"}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 relative",
            isActive
              ? isDarkMode
                ? "bg-blue-600/20 text-blue-300"
                : "bg-blue-50 text-blue-700"
              : isDarkMode
                ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900",
          )}
          onClick={() => {
            if (isMobile && setIsSheetOpen) {
              setIsSheetOpen(false)
            }
          }}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full" />
          )}
          <item.icon size={20} />
          {(item.label === t("Supervisao") && !!item.badge && Number(item.badge) > 0) && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute -top-1 -right-1 text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full",
                isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
              )}
            >
              {item.badge}
            </Badge>
          )}
          {(item.label === t("Ocorrencias") && !!item.badge && Number(item.badge) > 0) && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute -top-1 -right-1 text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full",
                "bg-red-600 text-white"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </div>
    )
  }

  const renderMenuItem = (item: MenuItem, index: number, alwaysShowLabel = false) => {
    const isActive = pathname === item.href
    const hasSubItems = item.items && item.items.length > 0
    const isOpen = openItems[item.label]
    if (collapsed && !isVisuallyExpanded && !alwaysShowLabel) {
      return renderCollapsedMenuItem(item, index)
    }

    if (hasSubItems) {
      return (
        <div key={index} className="mb-1">
          <button
            onClick={() => toggleItem(item.label)}
            className={cn(
              "flex items-center w-full px-4 py-3 text-sm rounded-lg transition-all duration-200 justify-between relative",
              isDarkMode
                ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                : "text-gray-700 hover:bg-gray-100/50 hover:text-gray-900",
            )}
          >
            <div className="flex items-center">
              <item.icon size={18} className={cn("mr-3", isDarkMode ? "text-gray-400" : "text-gray-500")} />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                isOpen ? "rotate-180" : "",
                isDarkMode ? "text-gray-400" : "text-gray-500",
              )}
            />
          </button>
          {isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.items?.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 relative",
                    pathname === subItem.href
                      ? isDarkMode
                        ? "bg-blue-600/20 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                      : isDarkMode
                        ? "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                        : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-800",
                  )}
                  onClick={() => {
                    if (isMobile && setIsSheetOpen) {
                      setIsSheetOpen(false)
                    }
                  }}
                >
                  {pathname === subItem.href && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full" />
                  )}
                  {subItem.icon && <subItem.icon size={16} className="mr-3" />}
                  <span>{subItem.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={index} className="mb-1">
        <Link
          href={item.href || "#"}
          className={cn(
            "flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 relative",
            isActive
              ? isDarkMode
                ? "bg-blue-600/20 text-blue-300"
                : "bg-blue-50 text-blue-700"
              : isDarkMode
                ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                : "text-gray-700 hover:bg-gray-100/50 hover:text-gray-900",
          )}
          onClick={() => {
            if (isMobile && setIsSheetOpen) {
              setIsSheetOpen(false)
            }
          }}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full" />
          )}
          <item.icon
            size={18}
            className={cn(
              "mr-3",
              isActive
                ? isDarkMode
                  ? "text-blue-300"
                  : "text-blue-700"
                : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-500",
            )}
          />
          <span className="font-medium">{item.label}</span>
          {(item.label === t("Supervisao") && !!item.badge && Number(item.badge) > 0) && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-auto text-xs px-2 py-0.5",
                isDarkMode ? "bg-blue-600/30 text-blue-300" : "bg-blue-100 text-blue-700"
              )}
            >
              {item.badge}
            </Badge>
          )}
          {(item.label === t("Ocorrencias") && !!item.badge && Number(item.badge) > 0) && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-auto text-xs px-2 py-0.5",
                "bg-red-600 text-white"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </div>
    )
  }

  const MobileSheetContent = () => (
    <div className="py-4 flex flex-col h-full">
      <div className="flex items-center mb-4 px-4">
        <Image src="/logo.png" alt="Logo" width={60} height={60} className="mr-3" />
      </div>
      <nav className="flex-1 px-2 overflow-y-auto custom-scrollbar">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            <div className="mb-2 px-2">
              <span
                className={cn(
                  "text-xs font-semibold ",
                  isDarkMode ? "text-gray-400" : "text-gray-500",
                )}
              >
                {section.title}
              </span>
            </div>
            <div className="space-y-1">{section.items.map((item, index) => renderMenuItem(item, index, true))}</div>
          </div>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent
            side="left"
            className={cn(
              "flex flex-col h-full w-72",
              isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
            )}
          >
            <MobileSheetContent />
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className={cn(
            "min-h-screen h-full flex flex-col transition-all duration-300 border-r overflow-hidden relative",
            isVisuallyExpanded ? "w-64" : "w-20",
            collapsed ? "py-6" : "",
            isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
            className,
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {collapsed && isHovered && (
            <div className="absolute inset-0 bg-blue-500/5 pointer-events-none transition-opacity duration-200" />
          )}

          <Link href="/" className="flex items-center justify-center px-4 py-5">
            {!isVisuallyExpanded ? (
              <Image src="/logo.png" alt="Logo" width={60} height={60} />
            ) : (
              <div className="flex items-center pt-4">
                <Image src="/logo.png" alt="Logo" width={90} height={90} className="mr-3" />
              </div>
            )}
          </Link>

          <div className="flex-1 overflow-y-auto p-3 mt-4 custom-scrollbar hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            <nav className="space-y-4">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {isVisuallyExpanded && (
                    <div className="mb-2">
                      <span
                        className={cn(
                          "text-sm font-semibold uppercase tracking-wider px-2 transition-opacity duration-200",
                          isDarkMode ? "text-gray-400" : "text-gray-500",
                          collapsed && isHovered ? "opacity-100" : "",
                        )}
                      >
                        {section.title}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">{section.items.map((item, index) => renderMenuItem(item, index))}</div>
                </div>
              ))}
            </nav>
          </div>

          <div className="pt-4 pb-2 border-t border-gray-200 flex items-center justify-center dark:border-gray-700">
            <Image
              src={isVisuallyExpanded ? "/prometeus-w-80.jpeg" : "/prometeus.jpeg"}
              alt="Prometeus"
              width={isVisuallyExpanded ? 120 : 32}
              height={isVisuallyExpanded ? 64 : 32}
              className="object-contain transition-all duration-300"
            />
          </div>
        </div>
      )}
      <div id="navigation-menu-portal" className="fixed z-50" />
    </>
  )
}
