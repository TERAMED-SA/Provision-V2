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
  AlertDialogFooter,
  AlertDialogCancel,
} from "../../ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Building, User, Package, Calendar, Clock, Info } from "lucide-react"
import { BreadcrumbRoutas } from "@/components/ulils/breadcrumbRoutas"
import { ptBR } from "date-fns/locale"
import { GetSupervisorsUseCase } from "@/features/application/domain/use-cases/supervisor/GetSupervisorsUseCase"
import { SupervisorFactory } from "@/features/application/infrastructure/factories/SupervisorFactory"

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

export type Supervisor = {
  code: string
  name: string
  // Adicione outras propriedades conforme necessário
}

export type Notification = {
  _id: string
  createdAt: string
  createdAtTime: string
  createdAtDate: Date
  siteName: string
  costCenter: string
  supervisorCode: string
  supervisorName: string
  details: string
  numberOfWorkers?: number
  workerInformation?: WorkerInfo[]
  equipment?: Equipment[]
  duration?: string
}

type Column<TData, TValue> = {
  toggleSorting: (desc: boolean) => void
  getIsSorted: () => "asc" | "desc" | false
}

type Row<TData> = {
  original: TData
  getValue: (id: string) => any
}

export function NewSupervionTable() {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<Notification[]>([])
  const [supervisors, setSupervisors] = React.useState<Supervisor[]>([])
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const supervisorPort = SupervisorFactory.getSupervisorPort()
  const getSupervisorsUseCase = new GetSupervisorsUseCase(supervisorPort)

  const fetchSupervisors = React.useCallback(async () => {
    try {
      const supervisorsData = await getSupervisorsUseCase.execute()
      console.log(supervisorsData)
 
    } catch (error) {
      console.error("Erro ao buscar supervisores:", error)
      toast.error("Não foi possível carregar os supervisores")
      return []
    }
  }, [])

  // Função para buscar notificações
  const fetchNotifications = React.useCallback(async (supervisorsData?: Supervisor[]) => {
    try {
      setIsLoading(true)
      const response = await instance.get(`/supervision?size=5000`)
      
      // Use os supervisores passados como parâmetro ou os já carregados no state
      const currentSupervisors = supervisorsData || supervisors
      
      const formattedNotifications = response.data.data.data.map((notification: any) => {
        // Ensure we're creating a proper Date object from the ISO string
        const createdAtDate = new Date(notification.createdAt)
        
        // Format the date in Brazilian format
        const formattedDate = format(createdAtDate, "dd/MM/yyyy", { locale: ptBR })
        const formattedTime = format(createdAtDate, "HH:mm", { locale: ptBR })
        
        // Buscar o nome do supervisor pelo código
        const supervisor = currentSupervisors.find(sup => sup.code === notification.supervisorCode)
        const supervisorName = supervisor ? supervisor.name : `Supervisor ${notification.supervisorCode}`
        
        return {
          ...notification,
          createdAt: formattedDate,
          createdAtTime: formattedTime,
          createdAtDate: createdAtDate,
          supervisorName,
          siteName: notification.name || "Carregando...",
        }
      }).sort((a: Notification, b: Notification) => b.createdAtDate.getTime() - a.createdAtDate.getTime())
      
      setData(formattedNotifications)
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message)
      toast.error("Erro ao carregar ocorrências")
    } finally {
      setIsLoading(false)
    }
  }, [supervisors])

  // Função para carregar dados iniciais
  const loadInitialData = React.useCallback(async () => {
    try {
      // Primeiro carrega os supervisores
      const supervisorsData = await fetchSupervisors()
      // Depois carrega as notificações com os supervisores já disponíveis
      await fetchNotifications(supervisorsData)
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error)
    }
  }, [fetchSupervisors, fetchNotifications])

  // Efeito para carregar dados iniciais e configurar polling
  React.useEffect(() => {
    loadInitialData()

    // Configurar polling para atualizar dados a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchNotifications() // Usa os supervisores já carregados no state
    }, 30000)

    return () => clearInterval(intervalId)
  }, [loadInitialData, fetchNotifications])

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
  accessorKey: "report",
  header: ({ column }: { column: Column<Notification, unknown> }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
      Relatório
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }: { row: Row<Notification> }) => {
    const value = row.getValue("report") as string
    if (!value) return null
    return value.length > 40 ? value.slice(0, 40) + "..." : value
  },
},
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }: { row: Row<Notification> }) => {
          const notification = row.original

          return (
            <div>
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
            enableColumnVisibility: true,
            enableColumnFilters: true,
            enableViewModeToggle: true,
           
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
                    <p>{selectedNotification.supervisorName}</p>
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
                document={<OccurrencePDF notification={selectedNotification!} />}
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