"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowUpDown, Download, Eye } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { toast } from "sonner"
import { OccurrencePDF } from "../pdf/occurrence-pdf"
import { Button } from "../../ui/button"
import { DataTable } from "../../ulils/data-table"
import instance from "@/lib/api"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../../ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Separator } from "../../ui/separator"
import { Building, User, Package, Calendar, Clock, Info } from "lucide-react"
import { BreadcrumbRoutas } from "@/components/ulils/breadcrumbRoutas"

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
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  
  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      BAIXA: "Baixa",
      MEDIA: "Média",
      ALTA: "Alta",
      CRITICA: "Crítica"
    }
    return labels[priority] || priority
  }

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


  const handleViewDetails = React.useCallback((notification: Notification) => {
    try {
      if (!notification || !notification._id) {
        toast.error("Dados da ocorrência inválidos")
        return
      }
      
      setSelectedNotification(notification)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Erro ao abrir detalhes:", error)
      toast.error("Erro ao abrir detalhes da ocorrência")
    }
  }, [])

  
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "costCenter",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Centro de Custo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
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
        id: "actions",
        header: "Ações",
        cell: ({ row }: { row: Row<Notification> }) => {
          const notification = row.original

          return (
            <div >
              <Button 
                variant="ghost" 
                size="sm" 
                className="cursor-pointer text-gray-600 hover:text-gray-100 hover:bg-gray-800"
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

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> Detalhes da Supervisão
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Centro de Custo</p>
                  <p className="font-medium">{selectedNotification.costCenter}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Site</p>
                  <p className="font-medium">{selectedNotification.siteName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data</p>
                  <p>{selectedNotification.createdAt} {selectedNotification.createdAtTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                  <p>{selectedNotification.supervisorName || "Não informado"}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Detalhes</p>
                <p className="whitespace-pre-line">{selectedNotification.details || "Sem detalhes disponíveis."}</p>
              </div>

              <Tabs defaultValue="workers" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="workers">Trabalhadores</TabsTrigger>
                  <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="workers" className="mt-4">
                  {selectedNotification.workerInformation && selectedNotification.workerInformation.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedNotification.workerInformation.map((worker, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <h4 className="font-medium">{worker.name}</h4>
                            </div>
                            <span className="text-sm text-muted-foreground">Nº {worker.employeeNumber}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Estado</p>
                              <p>{worker.state}</p>
                            </div>
                            {worker.obs && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                                <p className="text-sm">{worker.obs}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <Info className="h-6 w-6 mx-auto mb-2" />
                      <p>Nenhum trabalhador registrado nesta ocorrência.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="equipment" className="mt-4">
                  {selectedNotification.equipment && selectedNotification.equipment.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedNotification.equipment.map((equip, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              <h4 className="font-medium">{equip.name}</h4>
                            </div>
                            <span className="text-sm text-muted-foreground">Nº Série: {equip.serialNumber}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Estado</p>
                              <p>{equip.state}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Centro de Custo</p>
                              <p>{equip.costCenter}</p>
                            </div>
                            {equip.obs && (
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                                <p className="text-sm">{equip.obs}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <Info className="h-6 w-6 mx-auto mb-2" />
                      <p>Nenhum equipamento registrado nesta ocorrência.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <AlertDialogFooter className="flex items-center justify-between mt-4">
            <PDFDownloadLink
              document={<OccurrencePDF notification={selectedNotification!} getPriorityLabel={getPriorityLabel} />}
              fileName={`supervisao-${selectedNotification?.siteName}-${selectedNotification?._id}.pdf`}
              style={{ textDecoration: "none" }}
            >
              {({ loading: pdfLoading }) => (
                <Button variant="outline" disabled={pdfLoading}>
                  <Download className="h-4 w-4 mr-2" /> Baixar PDF
                </Button>
              )}
            </PDFDownloadLink>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </div>
  )
}