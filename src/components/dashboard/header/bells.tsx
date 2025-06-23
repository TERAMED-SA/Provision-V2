"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Bell, Clock, MapPin, Shield, AlertTriangle } from 'lucide-react'
import { format, isToday, isYesterday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSupervisionStore, NotificationItem } from "@/hooks/useDataStore"
import { useSupervisionData } from "@/hooks/useDataQueries"

export function Bells() {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)

  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    selectedDate,
    getTodayCounts 
  } = useSupervisionStore()

  // Initialize data fetching
  useSupervisionData()

  // Get today's counts for the notification badge
  const todayCounts = getTodayCounts()
  const totalTodayActivities = unreadNotificationsCount // Só mostrar badge se houver não lidas

  const displayNotifications = showAll ? notifications : notifications.slice(0, 4)

  // Separate notifications by type for better display
  const supervisionNotifications = notifications.filter(n => n.type === "supervision")
  const occurrenceNotifications = notifications.filter(n => n.type === "occurrence")

  const handleNotificationClick = (notification: NotificationItem) => {
    // Marcar como lida
    markNotificationAsRead(notification.id)

    if (notification.type === "supervision") {
      // Dispatch event first to ensure modal opens
      window.dispatchEvent(
        new CustomEvent("view-supervisor-detail", {
          detail: notification.data,
        }),
      )
      // Then navigate
      router.push(`/dashboard/supervisao?id=${notification.data.id}`)
    } else if (notification.type === "occurrence") {
      // Dispatch event first to ensure modal opens
      window.dispatchEvent(
        new CustomEvent("view-occurrence-detail", {
          detail: notification.data,
        }),
      )
      // Then navigate
      router.push(`/dashboard/ocorrencias?id=${notification.data.id}`)
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "supervision":
        return "Supervisão"
      case "occurrence":
        return "Ocorrência"
      default:
        return "Atividade"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "supervision":
        return <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "occurrence":
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: ptBR })
    } else if (isYesterday(date)) {
      return "Ontem"
    } else {
      return format(date, "dd/MM", { locale: ptBR })
    }
  }

  const getSelectedDateLabel = () => {
    if (isToday(selectedDate)) {
      return "hoje"
    } else if (isYesterday(selectedDate)) {
      return "ontem"
    } else {
      return format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <Bell className="h-4 w-4" />
            {totalTodayActivities > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium"
              >
                {totalTodayActivities > 9 ? "9+" : totalTodayActivities}
              </Badge>
            )}
          </Button>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-full max-w-xs sm:w-80 max-h-[500px] overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notificações</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                Atividades de {getSelectedDateLabel()}
              </p>
            </div>
            {unreadNotificationsCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllNotificationsAsRead} 
                className="text-xs h-7 px-2 rounded-full border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Marcar todas
              </Button>
            )}
          </div>
          
         
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {displayNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-base text-gray-500 dark:text-gray-400">
                Nenhuma notificação para {getSelectedDateLabel()}
              </p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "flex gap-3 items-start px-4 py-3 cursor-pointer transition-colors",
                  notification.isRead
                    ? "bg-gray-100 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-blue-50/40 dark:bg-blue-950/10 border-l-4 border-blue-400 dark:border-blue-700 text-gray-900 dark:text-white"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      notification.type === "supervision" 
                        ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
                        : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                    )}>
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  
                  <div className="font-medium text-gray-900 dark:text-white truncate text-sm mb-1">
                    {notification.data.siteName}
                  </div>
                  
                  {notification.type === "supervision" && (
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
                      Supervisor: {(notification.data as any).supervisorName}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600 dark:text-gray-300 truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {notification.description}
                  </div>
                </div>
                
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))
          )}

          {notifications.length > 4 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAll(!showAll)} 
                className="w-full h-9 text-xs rounded-full border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                {showAll ? "Mostrar menos" : `Ver mais (${notifications.length - 4})`}
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
