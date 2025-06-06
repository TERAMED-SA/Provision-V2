"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowUpDown, Download, Eye } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { toast } from "sonner"
import instance from "@/src/lib/api"
import { OccurrencePDF } from "../pdf/occurrence-pdf"
import { Button } from "../../ui/button"
import { DataTable } from "../../ulils/data-table"

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
  priority: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"
  details: string
  numberOfWorkers?: number
  workerInformation?: WorkerInfo[]
  equipment?: Equipment[]
  duration?: string
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
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<Notification[]>([])
  
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
          supervisorName: notification.supervisorName || "Carregando...",
          siteName: notification.name || "Carregando...",
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

  // Função para buscar métricas
  const fetchMetrics = React.useCallback(async () => {
    try {
      const response = await instance.get(`/admin/metrics?size=100&page=1`)
      setMetricsData(response.data.data.sites)
    } catch (error: any) {
      console.error("Error fetching metrics:", error.message)
      toast.error("Erro ao carregar métricas")
    }
  }, [])

  const updateNotificationsWithMetrics = React.useCallback((notifs: Notification[], metrics: any[]) => {
    return notifs.map((notification) => {
      const metricSite = metrics.find((site) => site.siteCostcenter === notification.costCenter)
      if (metricSite) {
        const supervisorName = metricSite.supervisor ? metricSite.supervisor.name : "Não encontrado"
        return {
          ...notification,
          supervisorName: supervisorName,
          siteName: metricSite.siteName || notification.siteName || "Sem site",
        }
      }
      return notification
    })
  }, [])

  React.useEffect(() => {
    const loadInitialData = async () => {
      await fetchNotifications()
      await fetchMetrics()
    }
    loadInitialData()
  }, [fetchNotifications, fetchMetrics])

  React.useEffect(() => {
    if (notifications.length > 0 && metricsData.length > 0) {
      const updatedNotifications = updateNotificationsWithMetrics(notifications, metricsData)
      const sorted = [...updatedNotifications].sort(
        (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
      )
      setData(sorted)
    } else if (notifications.length > 0) {
      const sorted = [...notifications].sort(
        (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
      )
      setData(sorted)
    }
  }, [notifications, metricsData, updateNotificationsWithMetrics])

  React.useEffect(() => {
    if (!date) {
      if (notifications.length > 0 && metricsData.length > 0) {
        const updatedNotifications = updateNotificationsWithMetrics(notifications, metricsData)
        const sorted = [...updatedNotifications].sort(
          (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
        )
        setData(sorted)
      }
    } else {
      const selectedDateStr = format(date, "dd/MM/yyyy")
      if (notifications.length > 0 && metricsData.length > 0) {
        const updatedNotifications = updateNotificationsWithMetrics(notifications, metricsData)
        const filtered = updatedNotifications.filter(
          notification => notification.createdAt === selectedDateStr
        )
        const sorted = [...filtered].sort(
          (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
        )
        setData(sorted)
      } else if (notifications.length > 0) {
        const filtered = notifications.filter(
          notification => notification.createdAt === selectedDateStr
        )
        const sorted = [...filtered].sort(
          (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
        )
        setData(sorted)
      }
    }
  }, [date, notifications, metricsData, updateNotificationsWithMetrics])

  // Função para ver detalhes de uma notificação
  const handleViewDetails = React.useCallback((notification: Notification) => {
    try {
      if (!notification || !notification._id) {
        toast.error("Dados da ocorrência inválidos")
        return
      }
      
      localStorage.setItem("selectedNotificationId", notification._id)
      
      const url = `/dashboard/supervisao/detalhes`
      router.push(url)
    } catch (error) {
      console.error("Erro ao navegar para detalhes:", error)
      toast.error("Erro ao abrir detalhes da ocorrência")
    }
  }, [router])

  // Definição das colunas da tabela
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
        accessorKey: "siteName",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Site
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
        accessorKey: "details",
        header: "Detalhes",
        cell: ({ row }: { row: Row<Notification> }) => {
          const details = row.getValue("details") as string
          return (
            <div className="max-w-[200px] truncate" title={details}>
              {details}
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
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="cursor-pointer text-gray-600 hover:text-green-900 hover:bg-green-100" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewDetails(notification)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>

              <PDFDownloadLink
                document={<OccurrencePDF notification={notification} />}
                fileName={`supervisao-${notification.siteName}-${notification._id}.pdf`}
                style={{ textDecoration: "none" }}
              >
                {({ loading: pdfLoading }: { loading: boolean }) => (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="cursor-pointer text-blue-600 hover:text-blue-900 hover:bg-blue-100" 
                    disabled={pdfLoading}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          )
        },
      },
    ],
    [handleViewDetails],
  )

  return (
    <div >
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
  )
}