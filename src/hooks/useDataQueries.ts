"use client"

import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import instance from "@/lib/api"
import { OccurrenceData, SupervisionData, useSupervisionStore } from "./useDataStore"
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory"

// Constantes para melhor performance
const REFETCH_INTERVAL = 500 // 0.5s conforme solicitado
const STALE_TIME = 100 // Dados considerados frescos por 100ms
const PAGE_SIZE = 1000000 // 1M registros para escalabilidade

export function useSupervisionData() {
  const queryClient = useQueryClient()
  const { setSupervisions, setOccurrences, setLoadingSupervisions, setLoadingOccurrences, showNewNotifications } =
    useSupervisionStore()

  // Load supervisors - otimizado com cache mais longo
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
    gcTime: 10 * 60 * 1000, // 10 minutes no cache
  })

  // Função memoizada para formatar dados de supervisão
  const formatSupervisionData = useCallback((data: any[], currentSupervisors: Map<string, string>) => {
    return data
      .map((notification: any) => {
        const createdAtDate = new Date(notification.createdAt)
        
        // Validação de data
        if (isNaN(createdAtDate.getTime())) {
          console.warn('Data inválida:', notification.createdAt)
          return null
        }

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
      .filter(Boolean) // Remove valores null
      .sort((a: SupervisionData, b: SupervisionData) => b.createdAtDate.getTime() - a.createdAtDate.getTime())
  }, [])

  // Função memoizada para formatar dados de ocorrência
  const formatOccurrenceData = useCallback((data: any[]) => {
    return data
      .map((notification: any) => {
        const createdAtDate = new Date(notification.createdAt)
        
        // Validação de data
        if (isNaN(createdAtDate.getTime())) {
          console.warn('Data inválida:', notification.createdAt)
          return null
        }

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
      .filter(Boolean) // Remove valores null
      .sort((a: OccurrenceData, b: OccurrenceData) => b.createdAtDate.getTime() - a.createdAtDate.getTime())
  }, [])

  // Fetch supervisions - otimizado
  const { data: supervisionData, isLoading: isLoadingSupervisions } = useQuery({
    queryKey: ["supervisions"],
    queryFn: async () => {
      try {
        const response = await instance.get(`/supervision?page=1&size=${PAGE_SIZE}`)

        if (!response.data?.data?.data) {
          console.error("Estrutura de resposta inválida:", response.data)
          throw new Error("Erro na estrutura dos dados recebidos")
        }

        const currentSupervisors = supervisors || new Map()
        return formatSupervisionData(response.data.data.data, currentSupervisors)
      } catch (error) {
        console.error("Erro ao buscar supervisões:", error)
        throw error
      }
    },
    enabled: !!supervisors,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  })

  // Fetch occurrences - otimizado
  const { data: occurrenceData, isLoading: isLoadingOccurrences } = useQuery({
    queryKey: ["occurrences"],
    queryFn: async () => {
      try {
        const response = await instance.get(`/occurrence?page=1&size=${PAGE_SIZE}`)

        if (!response.data?.data?.data) {
          throw new Error("Invalid response structure")
        }

        return formatOccurrenceData(response.data.data.data)
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error)
        throw error
      }
    },
    refetchInterval: REFETCH_INTERVAL, 
    staleTime: STALE_TIME,
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  })

  // Referências para detectar mudanças reais
  const prevSupervisionCount = React.useRef(0)
  const prevOccurrenceCount = React.useRef(0)

  // Update store when data changes - otimizado para detectar mudanças reais
  React.useEffect(() => {
    if (supervisionData && supervisionData.length !== prevSupervisionCount.current) {
      setSupervisions(supervisionData)
      prevSupervisionCount.current = supervisionData.length
      
      // Check for new notifications apenas quando há mudanças
      setTimeout(() => {
        showNewNotifications()
      }, 100) // Reduzido de 1000ms para 100ms
    }
  }, [supervisionData, setSupervisions, showNewNotifications])

  React.useEffect(() => {
    if (occurrenceData && occurrenceData.length !== prevOccurrenceCount.current) {
      setOccurrences(occurrenceData)
      prevOccurrenceCount.current = occurrenceData.length
      
      // Check for new notifications apenas quando há mudanças
      setTimeout(() => {
        showNewNotifications()
      }, 100) // Reduzido de 1000ms para 100ms
    }
  }, [occurrenceData, setOccurrences, showNewNotifications])

  React.useEffect(() => {
    setLoadingSupervisions(isLoadingSupervisions)
  }, [isLoadingSupervisions, setLoadingSupervisions])

  React.useEffect(() => {
    setLoadingOccurrences(isLoadingOccurrences)
  }, [isLoadingOccurrences, setLoadingOccurrences])

  // Manual refresh function - otimizado com Promise.all
  const refreshData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["supervisions"] }),
      queryClient.invalidateQueries({ queryKey: ["occurrences"] })
    ])
  }, [queryClient])

  // Memoizar estado de loading
  const isLoading = useMemo(() => 
    isLoadingSupervisions || isLoadingOccurrences, 
    [isLoadingSupervisions, isLoadingOccurrences]
  )

  return {
    refreshData,
    isLoading,
  }
}