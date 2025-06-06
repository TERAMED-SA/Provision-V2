"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowUpDown, Eye } from "lucide-react"
import { Button } from "@/src/ui/components/ui/button"
import { DataTable } from "../../ulils/data-table"
import { toast } from "sonner"
import instance from "@/src/lib/api"
import { BreadcrumbRoutas } from "../../ulils/breadcrumbRoutas"
import { DetailModal } from "../detalhesSupervision"

// Definição dos tipos
export type WorkerInfo = {
  name: string
  employeeNumber: string
  state: string
  obs?: string
}

export type Equipment = {
  name: string
  serialNumber: string
  state: string
  costCenter: string
  obs?: string
}

export type Notification = {
  _id: string
  idNotification?: string
  createdAt: string
  createdAtTime: string
  createdAtDate: Date
  siteName: string
  costCenter: string
  supervisorName: string
  supervisorCode: string
  details: string
  numberOfWorkers?: number
  workerInformation?: WorkerInfo[]
  equipment?: Equipment[]
  duration?: string
  time?: string
  report?: string
  workersFound?: number
  coordinates?: string
  validation?: boolean
}

// Tipagem para as colunas da tabela
type Column<TData, TValue> = {
  toggleSorting: (desc: boolean) => void
  getIsSorted: () => "asc" | "desc" | false
}

// Tipagem para as linhas da tabela
type Row<TData> = {
  original: TData
  getValue: (id: string) => any
}

export function NewSupervionTable() {
  const router = useRouter()
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [metricsData, setMetricsData] = React.useState<any[]>([])
  const [supervisorsData, setSupervisorsData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  
  // Função para buscar supervisores
  const fetchSupervisors = React.useCallback(async () => {
    try {
      const response = await instance.get(`/supervisors`) // Ajuste a URL conforme sua API
      setSupervisorsData(response.data.data || response.data)
    } catch (error: any) {
      console.error("Error fetching supervisors:", error.message)
      toast.error("Erro ao carregar supervisores")
    }
  }, [])

  // Função para buscar notificações
  const fetchNotifications = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await instance.get(`/supervision?size=100`)
      
      const formattedNotifications = response.data.data.data.map((notification: any) => {
        const createdAtDate = new Date(notification.createdAt)
        return {
          ...notification,
          createdAt: format(createdAtDate, "dd/MM/yyyy"),
          createdAtTime: format(createdAtDate, "HH:mm"),
          createdAtDate: createdAtDate,
          supervisorName: "Carregando...",
          siteName: notification.name || "Carregando...",
          duration: notification.time || "N/A",
          coordinates: notification.coordinates || "N/A",
        }
      })
   
      setNotifications(formattedNotifications)
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message)
      toast.error("Erro ao carregar ocorrências")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchMetrics = React.useCallback(async () => {
    try {
      const response = await instance.get(`/supervision`)
      setMetricsData(response.data.data.sites)
    } catch (error: any) {
      console.error("Error fetching metrics:", error.message)
      toast.error("Erro ao carregar métricas")
    }
  }, [])

  const updateNotificationsWithMetrics = React.useCallback((notifs: Notification[], metrics: any[], supervisors: any[]) => {
    return notifs.map((notification) => {
      const metricSite = metrics.find((site) => site.siteCostcenter === notification.costCenter)
      const supervisor = supervisors.find((sup) => sup.code === notification.supervisorCode || sup.id === notification.supervisorCode)
      
      let updatedNotification = { ...notification }
      
      if (metricSite) {
        updatedNotification.siteName = metricSite.siteName || notification.siteName || "Sem site"
      }
      
      if (supervisor) {
        updatedNotification.supervisorName = supervisor.name || "Supervisor não encontrado"
      } else {
        updatedNotification.supervisorName = "Supervisor não encontrado"
      }
      
      return updatedNotification
    })
  }, [])

  React.useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchNotifications(),
        fetchMetrics(),
        fetchSupervisors()
      ])
    }
    loadInitialData()
  }, [fetchNotifications, fetchMetrics, fetchSupervisors])

  React.useEffect(() => {
    if (notifications.length > 0) {
      const updatedNotifications = updateNotificationsWithMetrics(notifications, metricsData, supervisorsData)
      const sorted = [...updatedNotifications].sort(
        (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
      )
      setData(sorted)
    }
  }, [notifications, metricsData, supervisorsData, updateNotificationsWithMetrics])

  React.useEffect(() => {
    if (!date) {
      if (notifications.length > 0) {
        const updatedNotifications = updateNotificationsWithMetrics(notifications, metricsData, supervisorsData)
        const sorted = [...updatedNotifications].sort(
          (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
        )
        setData(sorted)
      }
    } else {
      const selectedDateStr = format(date, "dd/MM/yyyy")
      if (notifications.length > 0) {
        const updatedNotifications = updateNotificationsWithMetrics(notifications, metricsData, supervisorsData)
        const filtered = updatedNotifications.filter(
          notification => notification.createdAt === selectedDateStr
        )
        const sorted = [...filtered].sort(
          (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
        )
        setData(sorted)
      }
    }
  }, [date, notifications, metricsData, supervisorsData, updateNotificationsWithMetrics])

  // Função para abrir o modal de detalhes
  const handleViewDetails = React.useCallback((notification: Notification) => {
    setSelectedNotification(notification)
    setIsModalOpen(true)
  }, [])

  // Função para contar trabalhadores ausentes
  const getAbsentWorkers = (workerInformation: WorkerInfo[] = []) => {
    return workerInformation.filter(worker => 
      worker.state === "Falta justificada" || worker.state === "Falta injustificada"
    ).length
  }

  // Função para contar equipamentos inoperantes
  const getInoperativeEquipment = (equipment: Equipment[] = []) => {
    return equipment.filter(eq => 
      eq.state === "Inoperante" || eq.state === "Em manutenção"
    ).length
  }

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "createdAtTime",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Hora
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "supervisorName",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Supervisor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "siteName",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Site
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "coordinates",
        header: "Coordenadas",
        cell: ({ row }: { row: Row<Notification> }) => {
          const coordinates = row.getValue("coordinates") as string
          return (
            <div className="max-w-[100px] truncate" title={coordinates}>
              {coordinates || "N/A"}
            </div>
          )
        },
      },
      {
        id: "tlAusente",
        header: "TL Ausente",
        cell: ({ row }: { row: Row<Notification> }) => {
          const notification = row.original
          const absentCount = getAbsentWorkers(notification.workerInformation)
          return (
            <div className="text-center">
              {absentCount > 0 ? (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {absentCount}
                </span>
              ) : (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  0
                </span>
              )}
            </div>
          )
        },
      },
      {
        id: "eqInoperante",
        header: "EQ Inoperante",
        cell: ({ row }: { row: Row<Notification> }) => {
          const notification = row.original
          const inoperativeCount = getInoperativeEquipment(notification.equipment)
          return (
            <div className="text-center">
              {inoperativeCount > 0 ? (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {inoperativeCount}
                </span>
              ) : (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  0
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "report",
        header: "Relatório",
        cell: ({ row }: { row: Row<Notification> }) => {
          const report = row.getValue("report") as string
          return (
            <div className="max-w-[150px] truncate" title={report}>
              {report || "N/A"}
            </div>
          )
        },
      },
      {
        accessorKey: "duration",
        header: "Duração",
        cell: ({ row }: { row: Row<Notification> }) => {
          const duration = row.getValue("duration") as string
          return (
            <div className="text-center">
              {duration || "N/A"}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }: { row: Row<Notification> }) => {
          const notification = row.original

          return (
            <div className="flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="cursor-pointer text-blue-600 hover:text-blue-900 hover:bg-blue-100" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewDetails(notification)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [handleViewDetails],
  )

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <BreadcrumbRoutas />
        </div>
        <div className="col-span-1 md:col-span-2">
          <DataTable
            columns={columns}
            data={data}
            loading={isLoading}
            title="Supervisão"
            filterOptions={{
              enableSiteFilter: true,
              enableDateFilter: true,
            }}
            date={date}
            setDate={setDate}
            initialColumnVisibility={{
              details: false,
            }}
          />
        </div>
      </div>

      <DetailModal 
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}