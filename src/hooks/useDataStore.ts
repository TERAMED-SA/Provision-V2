import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { isSameDay } from "date-fns"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { Shield, AlertTriangle } from "lucide-react"

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

        // Filter data for selected date
        const selectedDateSupervisions = supervisions.filter((item) => isSameDay(item.createdAtDate, selectedDate))
        const selectedDateOccurrences = occurrences.filter((item) => isSameDay(item.createdAtDate, selectedDate))

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

        // Combine and sort by time (most recent first)
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

        // Controle para evitar toast duplicado
        if (!window.__shownToasts) {
          window.__shownToasts = new Set()
        }
        const shownToasts = window.__shownToasts as Set<string>

        // Filter new notifications that haven't been shown yet
        const newNotifications = notifications.filter((notif) => {
          const isNew = !shownNotificationIds.has(notif.id)
          const isRecent = !lastNotificationCheck || notif.createdAt > lastNotificationCheck
          return isNew && isRecent && notif.isNew && !shownToasts.has(notif.id)
        })

        // Show toast for new notifications (max 3 at a time), sem delay
        newNotifications.slice(0, 3).forEach((notif) => {
          const hora = notif.createdAt
            ? `${notif.createdAt.getHours().toString().padStart(2, "0")}:${notif.createdAt.getMinutes().toString().padStart(2, "0")}`
            : ""
          const message = notif.type === "supervision"
            ? `Recebeste uma nova Supervisão às ${hora}`
            : `Recebeste uma nova Ocorrência às ${hora}`
          toast(message, {
            duration: 10000,
            position: "top-right",
            style: {
              fontSize: "14px",
              minWidth: 220,
              borderRadius: "1rem",
              background: "#fff",
              color: "#1f2937",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              padding: "1rem 1rem",
              lineHeight: 1.4,
              whiteSpace: "pre-line",
              position: "relative"
            },
          })
          shownToasts.add(notif.id)
        })

        // Update shown notifications
        const newShownIds = new Set([...shownNotificationIds, ...newNotifications.map((n) => n.id)])

        set({
          shownNotificationIds: newShownIds,
          lastNotificationCheck: now,
        })
      },

      // Getters
      getRecentActivities: () => {
        const { supervisions, occurrences, selectedDate } = get()

        // Filter data for selected date
        const selectedDateSupervisions = supervisions.filter((item) => isSameDay(item.createdAtDate, selectedDate))
        const selectedDateOccurrences = occurrences.filter((item) => isSameDay(item.createdAtDate, selectedDate))

        // Get 5 most recent supervisions from selected date
        const recentSupervisions = selectedDateSupervisions.slice(0, 5).map((item) => ({
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
        const recentOccurrences = selectedDateOccurrences.slice(0, 5).map((item) => ({
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
        const supervision = supervisions.filter((item) => isSameDay(item.createdAtDate, selectedDate)).length
        const occurrence = occurrences.filter((item) => isSameDay(item.createdAtDate, selectedDate)).length
        return {
          supervision,
          occurrence,
        }
      },

      getTodayCounts: () => {
        // Sempre usar a data de hoje para os badges do sidebar
        const today = new Date()
        const { supervisions, occurrences } = get()
        const supervision = supervisions.filter((item) => isSameDay(item.createdAtDate, today)).length
        const occurrence = occurrences.filter((item) => isSameDay(item.createdAtDate, today)).length
        return {
          supervision,
          occurrence,
        }
      },

      getAvailableDates: () => {
        const { supervisions, occurrences } = get()

        // Get all unique dates from data
        const allDates = [...supervisions.map((s) => s.createdAtDate), ...occurrences.map((o) => o.createdAtDate)]
          .filter((date, index, self) => self.findIndex((d) => d.toDateString() === date.toDateString()) === index)
          .sort((a, b) => b.getTime() - a.getTime()) // Most recent first

        return allDates
      },
    }),
    {
      name: "supervision-store",
    },
  ),
)