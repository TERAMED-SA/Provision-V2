"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  MapPin,
  MessageSquare,
  Building2,
  BarChartIcon as ChartNoAxesCombined,
  ClipboardMinus,
  Shield,
  AudioLines,
  Trash2,
  MessageCircle,
  Settings,
  ChevronDown,
  Globe,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Sheet, SheetContent } from "../ui/sheet"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../ui/navigation-menu"
import { cn } from "@/lib/utils"

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
  badge?: string
}

export function Sidebar({
  className,
  collapsed = false,
  isMobile = false,
  isSheetOpen = false,
  setIsSheetOpen,
}: SidebarProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const t = useTranslations("Sidebar")

  const toggleItem = (label: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const menuSections = [
    {
      title: t("Atividades"),
      items: [
        { icon: Home, label: t("Dashboard"), href: "/dashboard" },
        { icon: Shield, label: t("Supervisao"), href: "/dashboard/supervisao" },
        { icon: ClipboardMinus, label: t("Ocorrencias"), href: "/dashboard/ocorrencias" },
        { icon: AudioLines, label: t("Auditorias"), href: "/dashboard/auditorias" },
        { icon: UserCheck, label: t("Inspeccao"), href: "/dashboard/inspeccao" },
        { icon: Trash2, label: t("Recolhas"), href: "/dashboard/recolhas" },
        { icon: MessageCircle, label: t("Reclamacoes"), href: "/dashboard/reclamacoes" },
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
      items: [{ icon: ChartNoAxesCombined, label: t("Analytics"), href: "/dashboard/analytics" }],
    },
    {
      title: t("Configuracoes"),
      items: [
        {
          icon: Settings,
          label: t("Configuracoes"),
          items: [
            { title: t("Clientes"), href: "/dashboard/configuracoes/clientes", icon: Building2 },
            { title: t("Utilizadores"), href: "/dashboard/configuracoes/utilizadores", icon: Users },
            { title: t("Zona"), href: "/dashboard/configuracoes/zona", icon: Globe },
            { title: t("Perfil"), href: "/dashboard/configuracoes/perfil", icon: UserCheck },
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
        <NavigationMenu key={index} >
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-colors bg-transparent border-0 hover:bg-transparent data-[state=open]:bg-transparent p-0",
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white data-[state=open]:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 data-[state=open]:bg-gray-100"
                )}
              >
                <item.icon size={20} className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
              </NavigationMenuTrigger>
              <NavigationMenuContent
                className={cn(
                  "min-w-[200px]  p-2 ml-2",
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                )}
              >
                <div className="space-y-1">
                  {item.items?.map((subItem, subIndex) => (
                    <NavigationMenuLink key={subIndex} asChild>
                      <Link
                        href={subItem.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                          pathname === subItem.href
                            ? isDarkMode
                              ? "bg-blue-900/50 text-blue-300"
                              : "bg-blue-50 text-blue-700"
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
      )
    }

    return (
      <div key={index} className="mb-1">
        <Link
          href={item.href || "#"}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
            isActive
              ? isDarkMode
                ? "bg-blue-900/50 text-blue-300"
                : "bg-blue-50 text-blue-700"
              : isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
          onClick={() => {
            if (isMobile && setIsSheetOpen) {
              setIsSheetOpen(false)
            }
          }}
        >
          <item.icon
            size={20}
            className={
              isActive
                ? isDarkMode
                  ? "text-blue-300"
                  : "text-blue-600"
                : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
            }
          />
        </Link>
      </div>
    )
  }

  const renderMenuItem = (item: MenuItem, index: number, alwaysShowLabel = false) => {
    const isActive = pathname === item.href
    const hasSubItems = item.items && item.items.length > 0
    const isOpen = openItems[item.label]

    if (collapsed && !alwaysShowLabel) {
      return renderCollapsedMenuItem(item, index)
    }

    if (hasSubItems) {
      return (
        <div key={index} className="mb-1">
          <button
            onClick={() => toggleItem(item.label)}
            className={cn(
              "flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors justify-between",
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <div className="flex items-center">
              <item.icon
                size={18}
                className={cn("mr-3", isDarkMode ? "text-gray-400" : "text-gray-600")}
              />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                isOpen ? "rotate-180" : "",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}
            />
          </button>

          {isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.items?.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
                    pathname === subItem.href
                      ? isDarkMode
                        ? "bg-blue-900/50 text-blue-300 "
                        : "bg-blue-50 text-blue-700 "
                      : isDarkMode
                        ? "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  )}
                  onClick={() => {
                    if (isMobile && setIsSheetOpen) {
                      setIsSheetOpen(false)
                    }
                  }}
                >
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
            "flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors",
            isActive
              ? isDarkMode
                ? "bg-blue-900/50 text-blue-300 "
                : "bg-blue-50 text-blue-700 "
              : isDarkMode
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
          onClick={() => {
            if (isMobile && setIsSheetOpen) {
              setIsSheetOpen(false)
            }
          }}
        >
          <item.icon
            size={18}
            className={cn(
              "mr-3",
              isActive
                ? isDarkMode
                  ? "text-blue-300"
                  : "text-blue-600"
                : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
            )}
          />
          <span className="font-medium">{item.label}</span>
          {item.badge && (
            <span
              className={cn(
                "ml-auto px-2 py-0.5 text-xs rounded-full",
                isDarkMode ? "bg-orange-900/50 text-orange-300" : "bg-orange-100 text-orange-600"
              )}
            >
              {item.badge}
            </span>
          )}
        </Link>
      </div>
    )
  }
  
  const MobileSheetContent = () => (
    <div className="py-4 flex flex-col h-full">
      <div className="flex items-center mb-6 px-4">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="mr-3" />
      </div>

      <nav className="flex-1 px-2 overflow-y-auto custom-scrollbar">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <div className="mb-3 px-2">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
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
              "flex flex-col h-full w-80",
              isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            )}
          >
            <MobileSheetContent />
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className={cn(
            "min-h-screen h-full flex flex-col transition-all duration-300 border-r overflow-hidden",
            collapsed ? "w-20 py-8" : "w-72",
            isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
            className
          )}
        >
          <Link href="/" className="flex items-center justify-center px-4 ">
            {collapsed ? (
              <Image src="/logo.png" alt="Logo" width={80} height={80} />
            ) : (
              <div className="flex items-center pt-6">
                <Image src="/logo.png" alt="Logo" width={100} height={100} className="mr-3" />
              </div>
            )}
          </Link>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            <nav className="space-y-6">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {!collapsed && (
                    <div className="mb-3">
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wider px-2",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
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

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Image
              src={collapsed ? "/prometeus.jpeg" : "/prometeus-w-80.jpeg"}
              alt="Prometeus"
              width={collapsed ? 80 : 288}
              height={collapsed ? 80 : 80}
              className="w-full object-contain"
            />
          </div>
        </div>
      )}

      <div id="navigation-menu-portal" className="fixed z-50" />
    </>
  )
}