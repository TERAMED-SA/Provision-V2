import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { isSameDay } from "date-fns"
import toast from "react-hot-toast"
import { CheckCircle, AlertCircle } from "lucide-react"

// Sistema global de controle de toasts otimizado
const createToastManager = () => {
  let shownToasts = new Set<string>()
  let lastClearTime = Date.now()
  const CLEAR_INTERVAL = 30000 // 30 segundos

  return {
    shouldShow: (id: string) => {
      const now = Date.now()
      // Limpar cache periodicamente
      if (now - lastClearTime > CLEAR_INTERVAL) {
        shownToasts.clear()
        lastClearTime = now
      }
      
      if (shownToasts.has(id)) return false
      shownToasts.add(id)
      return true
    }
  }
}

const toastManager = createToastManager()

declare global {
  interface Window {
    __shownToasts?: Set<string>;
  }
}

export interface SupervisionData {
  id: string
  name: string
  supervisorCode: string
  supervisorName: string
  createdAt: string
  createdAtTime: string
  createdAtDate: Date
  siteName: string
  coordinates?: string
  tlAbsent?: string
  time?: string
}

export interface OccurrenceData {
  id: string
  name: string
  createdAt: string
  createdAtTime: string
  createdAtDate: Date
  siteName: string
  coordinates?: string
  duration?: string
  description?: string
}

export interface NotificationItem {
  id: string
  type: "supervision" | "occurrence"
  title: string
  description: string
  createdAt: Date
  data: SupervisionData | OccurrenceData
  isRead: boolean
  isNew: boolean
}

interface SupervisionStore {
  // Data
  supervisions: SupervisionData[]
  occurrences: OccurrenceData[]
  notifications: NotificationItem[]

  // Selected date for filtering
  selectedDate: Date

  // Loading states
  isLoadingSupervisions: boolean
  isLoadingOccurrences: boolean

  // Counters
  selectedDateSupervisionCount: number
  selectedDateOccurrenceCount: number
  unreadNotificationsCount: number

  // Notification management
  lastNotificationCheck: Date | null
  shownNotificationIds: Set<string>

  // Actions
  setSupervisions: (data: SupervisionData[]) => void
  setOccurrences: (data: OccurrenceData[]) => void
  setSelectedDate: (date: Date) => void
  setLoadingSupervisions: (loading: boolean) => void
  setLoadingOccurrences: (loading: boolean) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  updateNotifications: () => void
  showNewNotifications: () => void

  // Getters
  getRecentActivities: () => NotificationItem[]
  getSelectedDateCounts: () => { supervision: number; occurrence: number }
  getTodayCounts: () => { supervision: number; occurrence: number }
  getAvailableDates: () => Date[]
}

export const useSupervisionStore = create<SupervisionStore>()(
  devtools(
    (set, get) => ({
      // Initial state - default to today
      supervisions: [],
      occurrences: [],
      notifications: [],
      selectedDate: new Date(),
      isLoadingSupervisions: false,
      isLoadingOccurrences: false,
      selectedDateSupervisionCount: 0,
      selectedDateOccurrenceCount: 0,
      unreadNotificationsCount: 0,
      lastNotificationCheck: null,
      shownNotificationIds: new Set(),

      // Actions
      setSupervisions: (data) => {
        set({ supervisions: data })
        get().updateNotifications()
      },

      setOccurrences: (data) => {
        set({ occurrences: data })
        get().updateNotifications()
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date })
        get().updateNotifications()
      },

      setLoadingSupervisions: (loading) => set({ isLoadingSupervisions: loading }),
      setLoadingOccurrences: (loading) => set({ isLoadingOccurrences: loading }),

      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, isRead: true, isNew: false } : notif,
          ),
          unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
            isNew: false,
          })),
          unreadNotificationsCount: 0,
        })),

      updateNotifications: () => {
        const { supervisions, occurrences, selectedDate } = get()

        // Otimização: verificar se há dados antes de processar
        if (!supervisions.length && !occurrences.length) return

        // Filter data for selected date - otimizado
        const selectedDateSupervisions = supervisions.filter((item) => 
          item.createdAtDate && isSameDay(item.createdAtDate, selectedDate)
        )
        const selectedDateOccurrences = occurrences.filter((item) => 
          item.createdAtDate && isSameDay(item.createdAtDate, selectedDate)
        )

        // Update counts
        set({
          selectedDateSupervisionCount: selectedDateSupervisions.length,
          selectedDateOccurrenceCount: selectedDateOccurrences.length,
        })

        // Create notifications from selected date's supervisions
        const supervisionNotifications: NotificationItem[] = selectedDateSupervisions.map((supervision) => ({
          id: `supervision-${supervision.id}`,
          type: "supervision" as const,
          title: `Nova Supervisão - ${supervision.siteName}`,
          description: `Supervisor: ${supervision.supervisorName} às ${supervision.createdAtTime}`,
          createdAt: supervision.createdAtDate,
          data: supervision,
          isRead: false,
          isNew: true,
        }))

        // Create notifications from selected date's occurrences
        const occurrenceNotifications: NotificationItem[] = selectedDateOccurrences.map((occurrence) => ({
          id: `occurrence-${occurrence.id}`,
          type: "occurrence" as const,
          title: `Nova Ocorrência - ${occurrence.siteName}`,
          description: `${occurrence.description || "Ocorrência registrada"} às ${occurrence.createdAtTime}`,
          createdAt: occurrence.createdAtDate,
          data: occurrence,
          isRead: false,
          isNew: true,
        }))

        // Combine and sort by time (most recent first) - otimizado
        const allNotifications = [...supervisionNotifications, ...occurrenceNotifications].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )

        const unreadCount = allNotifications.filter((n) => !n.isRead).length

        set({
          notifications: allNotifications,
          unreadNotificationsCount: unreadCount,
        })
      },

      showNewNotifications: () => {
        const { notifications, shownNotificationIds, lastNotificationCheck } = get()
        const now = new Date()

        // Otimização: verificar se há notificações
        if (!notifications.length) return

        // Filter new notifications that haven't been shown yet - otimizado
        const newNotifications = notifications.filter((notif) => {
          const isNew = !shownNotificationIds.has(notif.id)
          const isRecent = !lastNotificationCheck || notif.createdAt > lastNotificationCheck
          const shouldShow = toastManager.shouldShow(notif.id)
          return isNew && isRecent && notif.isNew && shouldShow
        })

        // Show toast for new notifications (max 3 at a time) - corrigido e otimizado
        if (newNotifications.length > 0) {
          newNotifications.slice(0, 3).forEach((notif) => {
            const hora = notif.createdAt
              ? `${notif.createdAt.getHours().toString().padStart(2, "0")}:${notif.createdAt.getMinutes().toString().padStart(2, "0")}`
              : ""
            
            const message = notif.type === "supervision"
              ? ` Recebeste uma nova Supervisão às ${hora}`
              : ` Recebeste uma nova Ocorrência às ${hora}`
            
            // Toast otimizado com melhor estilo
            toast(message, {
              duration: 15000,
              position: "top-right",
              style: {
                fontSize: "14px",
                minWidth: 280,
                borderRadius: "12px",
                background: notif.type === "supervision" ? "#f0f9ff" : "#fefce8",
                color: "#1f2937",
                border: notif.type === "supervision" ? "1px solid #0ea5e9" : "1px solid #eab308",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                padding: "12px 16px",
                lineHeight: 1.4,
              },
              icon:
                notif.type === "supervision"
                  ? CheckCircle({ size: 22, color: "#0ea5e9" })
                  : AlertCircle({ size: 22, color: "#eab308" }),
            })
          })

          // Update shown notifications
          const newShownIds = new Set([...shownNotificationIds, ...newNotifications.map((n) => n.id)])

          set({
            shownNotificationIds: newShownIds,
            lastNotificationCheck: now,
          })
        }
      },

      // Getters - otimizados
      getRecentActivities: () => {
        const { supervisions, occurrences, selectedDate } = get()

        // Filter data for selected date - otimizado com slice antecipado
        const selectedDateSupervisions = supervisions
          .filter((item) => item.createdAtDate && isSameDay(item.createdAtDate, selectedDate))
          .slice(0, 5)

        const selectedDateOccurrences = occurrences
          .filter((item) => item.createdAtDate && isSameDay(item.createdAtDate, selectedDate))
          .slice(0, 5)

        // Get 5 most recent supervisions from selected date
        const recentSupervisions = selectedDateSupervisions.map((item) => ({
          id: `supervision-${item.id}`,
          type: "supervision" as const,
          title: item.siteName,
          description: `Supervisor: ${item.supervisorName}`,
          createdAt: item.createdAtDate,
          data: item,
          isRead: false,
          isNew: false,
        }))

        // Get 5 most recent occurrences from selected date
        const recentOccurrences = selectedDateOccurrences.map((item) => ({
          id: `occurrence-${item.id}`,
          type: "occurrence" as const,
          title: item.siteName,
          description: item.description || "Ocorrência registrada",
          createdAt: item.createdAtDate,
          data: item,
          isRead: false,
          isNew: false,
        }))

        // Combine and sort by time (most recent first)
        return [...recentSupervisions, ...recentOccurrences]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10) // Return top 10 activities
      },

      getSelectedDateCounts: () => {
        const { supervisions, occurrences, selectedDate } = get()
        return {
          supervision: supervisions.filter((item) => 
            item.createdAtDate && isSameDay(item.createdAtDate, selectedDate)
          ).length,
          occurrence: occurrences.filter((item) => 
            item.createdAtDate && isSameDay(item.createdAtDate, selectedDate)
          ).length,
        }
      },

      getTodayCounts: () => {
        // Sempre usar a data de hoje para os badges do sidebar
        const today = new Date()
        const { supervisions, occurrences } = get()
        return {
          supervision: supervisions.filter((item) => 
            item.createdAtDate && isSameDay(item.createdAtDate, today)
          ).length,
          occurrence: occurrences.filter((item) => 
            item.createdAtDate && isSameDay(item.createdAtDate, today)
          ).length,
        }
      },

      getAvailableDates: () => {
        const { supervisions, occurrences } = get()

        // Otimização: usar Set para datas únicas
        const dateSet = new Set<string>()
        
        supervisions.forEach(s => {
          if (s.createdAtDate) {
            dateSet.add(s.createdAtDate.toDateString())
          }
        })
        
        occurrences.forEach(o => {
          if (o.createdAtDate) {
            dateSet.add(o.createdAtDate.toDateString())
          }
        })

        // Convert back to Date objects and sort
        return Array.from(dateSet)
          .map(dateStr => new Date(dateStr))
          .sort((a, b) => b.getTime() - a.getTime()) // Most recent first
      },
    }),
    {
      name: "supervision-store",
    },
  ),
)