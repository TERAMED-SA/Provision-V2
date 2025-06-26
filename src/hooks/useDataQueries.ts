"use client"

import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import instance from "@/lib/api"
import { OccurrenceData, SupervisionData, useSupervisionStore } from "./useDataStore"
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory"

export function useSupervisionData() {
  const queryClient = useQueryClient()
  const { setSupervisions, setOccurrences, setLoadingSupervisions, setLoadingOccurrences, showNewNotifications } =
    useSupervisionStore()

  // Load supervisors
  const { data: supervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const users = await userAdapter.getUsers()
      const supervisorMap = new Map<string, string>()

      users.forEach((user: any) => {
        const code = user.employeeId || user._id
        supervisorMap.set(code, user.name)
      })

      return supervisorMap
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch supervisions
  const { data: supervisionData, isLoading: isLoadingSupervisions } = useQuery({
    queryKey: ["supervisions"],
    queryFn: async () => {
      try {
        const response = await instance.get(`/supervision?page=1&size=100000`)

        if (!response.data?.data?.data) {
          console.error("Estrutura de resposta inválida:", response.data)
          throw new Error("Erro na estrutura dos dados recebidos")
        }

        const currentSupervisors = supervisors || new Map()
        const formattedData: SupervisionData[] = response.data.data.data
          .map((notification: any) => {
            const createdAtDate = new Date(notification.createdAt)
            const formattedDate = format(createdAtDate, "dd/MM/yyyy", { locale: ptBR })
            const formattedTime = format(createdAtDate, "HH:mm", { locale: ptBR })

            const supervisorName =
              currentSupervisors.get(notification.supervisorCode) || `Supervisor ${notification.supervisorCode}`

            let formattedDuration = "-"
            if (notification.time) {
              const timeDate = new Date(notification.time)
              if (!isNaN(timeDate.getTime())) {
                formattedDuration = format(timeDate, "HH:mm")
              } else if (typeof notification.time === "string") {
                const match = notification.time.match(/^(\d{1,2}):(\d{2})/)
                if (match) {
                  formattedDuration = `${match[1].padStart(2, "0")}:${match[2]}`
                }
              }
            }

            return {
              ...notification,
              createdAt: formattedDate,
              createdAtTime: formattedTime,
              createdAtDate: createdAtDate,
              supervisorName,
              siteName: notification.name || "Site não informado",
              coordinates: notification.coordinates || "-",
              tlAbsent: notification.tlAbsent || "-",
              time: formattedDuration,
            }
          })
          // Sort by creation date/time (most recent first)
          .sort((a: SupervisionData, b: SupervisionData) => b.createdAtDate.getTime() - a.createdAtDate.getTime())

        return formattedData
      } catch (error) {
        console.error("Erro ao buscar supervisões:", error)
        throw error
      }
    },
    enabled: !!supervisors,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 1000, // Consider data stale after 10 seconds
  })

  // Fetch occurrences
  const { data: occurrenceData, isLoading: isLoadingOccurrences } = useQuery({
    queryKey: ["occurrences"],
    queryFn: async () => {
      try {
        const response = await instance.get("/occurrence?page=1&size=100000")

        if (!response.data?.data?.data) {
          throw new Error("Invalid response structure")
        }

        const formattedData: OccurrenceData[] = response.data.data.data
          .map((notification: any) => {
            const createdAtDate = new Date(notification.createdAt)
            const formattedDate = format(createdAtDate, "dd/MM/yyyy", { locale: ptBR })
            const formattedTime = format(createdAtDate, "HH:mm", { locale: ptBR })

            return {
              ...notification,
              createdAt: formattedDate,
              createdAtTime: formattedTime,
              createdAtDate: createdAtDate,
              siteName: notification.name || "Site não informado",
              coordinates: notification.coordinates || "-",
              duration: notification.duration || "-",
              description: notification.description || "Ocorrência registrada",
            }
          })
          // Sort by creation date/time (most recent first)
          .sort((a: OccurrenceData, b: OccurrenceData) => b.createdAtDate.getTime() - a.createdAtDate.getTime())

        return formattedData
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error)
        throw error
      }
    },
    refetchInterval: 30000, 
    staleTime: 1000, 
  })

  // Update store when data changes
  React.useEffect(() => {
    if (supervisionData) {
      setSupervisions(supervisionData)
      // Check for new notifications
      setTimeout(() => {
        showNewNotifications()
      }, 1000)
    }
  }, [supervisionData, setSupervisions, showNewNotifications])

  React.useEffect(() => {
    if (occurrenceData) {
      setOccurrences(occurrenceData)
      // Check for new notifications
      setTimeout(() => {
        showNewNotifications()
      }, 1000)
    }
  }, [occurrenceData, setOccurrences, showNewNotifications])

  React.useEffect(() => {
    setLoadingSupervisions(isLoadingSupervisions)
  }, [isLoadingSupervisions, setLoadingSupervisions])

  React.useEffect(() => {
    setLoadingOccurrences(isLoadingOccurrences)
  }, [isLoadingOccurrences, setLoadingOccurrences])

  // Manual refresh function
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["supervisions"] })
    queryClient.invalidateQueries({ queryKey: ["occurrences"] })
  }, [queryClient])

  return {
    refreshData,
    isLoading: isLoadingSupervisions || isLoadingOccurrences,
  }
}