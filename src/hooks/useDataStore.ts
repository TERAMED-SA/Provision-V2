import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { isSameDay } from "date-fns"
import toast from "react-hot-toast"

const createToastManager = () => {
  let shownToasts = new Set<string>()
  let lastClearTime = Date.now()
  const CLEAR_INTERVAL = 3000 

  return {
    shouldShow: (id: string) => {
      const now = Date.now()
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
  supervisions: SupervisionData[]
  occurrences: OccurrenceData[]
  notifications: NotificationItem[]
  selectedDate: Date
  isLoadingSupervisions: boolean
  isLoadingOccurrences: boolean
  selectedDateSupervisionCount: number
  selectedDateOccurrenceCount: number
  unreadNotificationsCount: number
  lastNotificationCheck: Date | null
  shownNotificationIds: Set<string>
  setSupervisions: (data: SupervisionData[]) => void
  setOccurrences: (data: OccurrenceData[]) => void
  setSelectedDate: (date: Date) => void
  setLoadingSupervisions: (loading: boolean) => void
  setLoadingOccurrences: (loading: boolean) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  updateNotifications: () => void
  showNewNotifications: () => void
  getRecentActivities: () => NotificationItem[]
  getSelectedDateCounts: () => { supervision: number; occurrence: number }
  getTodayCounts: () => { supervision: number; occurrence: number }
  getAvailableDates: () => Date[]
}

export const useSupervisionStore = create<SupervisionStore>()(
  devtools(
    (set, get) => ({
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

        if (!supervisions.length && !occurrences.length) return

        const selectedDateSupervisions = supervisions.filter((item) => 
          item.createdAtDate && isSameDay(item.createdAtDate, selectedDate)
        )
        const selectedDateOccurrences = occurrences.filter((item) => 
          item.createdAtDate && isSameDay(item.createdAtDate, selectedDate)
        )

        set({
          selectedDateSupervisionCount: selectedDateSupervisions.length,
          selectedDateOccurrenceCount: selectedDateOccurrences.length,
        })

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
        if (!notifications.length) return
        const newNotifications = notifications.filter((notif) => {
          const isNew = !shownNotificationIds.has(notif.id)
          const isRecent = !lastNotificationCheck || notif.createdAt > lastNotificationCheck
          const shouldShow = toastManager.shouldShow(notif.id)
          return isNew && isRecent && notif.isNew && shouldShow
        })
        if (newNotifications.length > 0) {
          newNotifications.slice(0, 3).forEach((notif) => {
            const hora = notif.createdAt
              ? `${notif.createdAt.getHours().toString().padStart(2, "0")}:${notif.createdAt.getMinutes().toString().padStart(2, "0")}`
              : ""
            
            const message = notif.type === "supervision"
              ? ` Recebeste uma nova Supervisão às ${hora}`
              : ` Recebeste uma nova Ocorrência às ${hora}`
            
            toast(message, {
              duration: 8000,
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
              }
            })
          })

          const newShownIds = new Set([...shownNotificationIds, ...newNotifications.map((n) => n.id)])

          set({
            shownNotificationIds: newShownIds,
            lastNotificationCheck: now,
          })
        }
      },

      getRecentActivities: () => {
        const { supervisions, occurrences, selectedDate } = get()

        const selectedDateSupervisions = supervisions
          .filter((item) => item.createdAtDate && isSameDay(item.createdAtDate, selectedDate))
          .slice(0, 5)

        const selectedDateOccurrences = occurrences
          .filter((item) => item.createdAtDate && isSameDay(item.createdAtDate, selectedDate))
          .slice(0, 5)

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

        return [...recentSupervisions, ...recentOccurrences]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10)
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

        return Array.from(dateSet)
          .map(dateStr => new Date(dateStr))
          .sort((a, b) => b.getTime() - a.getTime())
      },
    }),
    {
      name: "supervision-store",
    },
  ),
)