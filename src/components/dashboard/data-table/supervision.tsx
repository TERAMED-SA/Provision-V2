"use client"

import * as React from "react"
import { format } from "date-fns"
import { ArrowUpDown, Download,  Shield, Loader2 } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { toast } from "sonner"
import { OccurrencePDF } from "../pdf/occurrence-pdf"
import { Button } from "../../ui/button"
import { DataTable } from "../../ulils/data-table"
import instance from "@/lib/api"
import { GenericDetailModal } from "../generic-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { User, Info } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory"
import { getPriorityLabel } from "./occurrence"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  time?: string
  coordinates?: string
  tlAbsent?: string
  report?: string
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
  const [supervisors, setSupervisors] = React.useState<Map<string, string>>(new Map())
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const pageSize = 10000

  const loadSupervisors = React.useCallback(async () => {
    try {
      const users = await userAdapter.getUsers()
      const supervisorMap = new Map<string, string>()

      users.forEach((user: any) => {
        const code = user.employeeId || user._id
        supervisorMap.set(code, user.name)
      })

      setSupervisors(supervisorMap)
      return supervisorMap
    } catch (error) {
      console.error("Erro ao carregar supervisores:", error)
      return new Map()
    }
  }, [])

  const fetchNotifications = React.useCallback(
    async (page = 1000, supervisorMap?: Map<string, string>) => {
      try {
        setIsLoading(true)
        const response = await instance.get(`/supervision?page=${page}&size=${pageSize}`)

        if (!response.data?.data?.data) {
          console.error("Estrutura de resposta inválida:", response.data)
          toast.error("Erro na estrutura dos dados recebidos")
          return
        }
        const currentSupervisors = supervisorMap || supervisors

        const formattedNotifications = response.data.data.data
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
                  formattedDuration = `${match[1].padStart(2, '0')}:${match[2]}`
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
          .sort((a: Notification, b: Notification) => b.createdAtDate.getTime() - a.createdAtDate.getTime())

        setData(formattedNotifications)
      
      } catch (error: any) {
        console.error("Erro ao buscar notificações:", error)
        toast.error("Erro ao carregar ocorrências")
      } finally {
        setIsLoading(false)
      }
    },
    [supervisors, pageSize],
  )

  React.useEffect(() => {
    const loadInitialData = async () => {
      const supervisorMap = await loadSupervisors()
      await fetchNotifications(1, supervisorMap)
    }

    loadInitialData()
  }, [])

  const handleViewDetails = React.useCallback((notification: Notification) => {
    if (!notification || !notification._id) {
      toast.error("Dados da supervisao inválidos")
      return
    }

    setSelectedNotification(notification)
    setIsModalOpen(true)
  }, [])

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Data
          </span>
        ),
        filterFn: (row: Row<Notification>, id: string, value: Date) => {
          if (!value) return true;
          const [day, month, year] = (row.getValue(id) as string).split("/");
          const rowDate = new Date(Number(year), Number(month) - 1, Number(day));
          return (
            rowDate.getDate() === value.getDate() &&
            rowDate.getMonth() === value.getMonth() &&
            rowDate.getFullYear() === value.getFullYear()
          );
        },
      },
      {
        accessorKey: "createdAtTime",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Hora
          </span>
        ),
      },
      {
        accessorKey: "siteName",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Site
          </span>
        ),
      },
      {
        accessorKey: "supervisorName",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Supervisor
          </span>
        ),
      },

      {
        accessorKey: "coordinates",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Coordenadas
          </span>
        ),
        cell: ({ row }: { row: Row<Notification> }) => {
          const value = row.getValue("coordinates") as string
          return value || "-"
        },
      },
      {
        accessorKey: "tlAbsent",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            TL 
          </span>
        ),
        cell: ({ row }: { row: Row<Notification> }) => {
          const value = row.getValue("tlAbsent") as string
          return value || "-"
        },
      },

      {
        accessorKey: "time",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Duração
          </span>
        ),
        cell: ({ row }: { row: Row<Notification> }) => {
          const value = row.getValue("time") as string
          return value || "-"
        },
      },
    ],
    [handleViewDetails],
  )

  return (
    <div className="grid grid-cols-1">
   
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
          }}
          date={date}
          setDate={setDate}
          initialColumnVisibility={{
            details: false,
          }}    
          handleViewDetails={handleViewDetails}
        />

        {selectedNotification && (
          <GenericDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Detalhes da Supervisão"
            icon={Shield}
            footerContent={
              <PDFDownloadLink
                document={<OccurrencePDF notification={{ ...selectedNotification, priority: 'BAIXA' }} getPriorityLabel={getPriorityLabel} />}
                fileName={`supervisao-${selectedNotification?.siteName}-${selectedNotification?._id}.pdf`}
                style={{ textDecoration: "none" }}
              >
                {({ loading: pdfLoading }) => (
                  <Button variant="outline" disabled={pdfLoading}>
                    {pdfLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Baixar PDF
                  </Button>
                )}
              </PDFDownloadLink>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <div>
                  <p className="text-sm font-medium text-muted-foreground">Data</p>
                  <p>
                    {selectedNotification.createdAt} {selectedNotification.createdAtTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Centro de Custo</p>
                  <p className="font-medium">{selectedNotification.costCenter}</p>
                </div>
            
           
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                  <p>{selectedNotification.supervisorName}</p>
                </div>
              </div>
               <div className="grid grid-cols-1 gap-1 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Site</p>
                  <p className="font-medium">{selectedNotification.siteName}</p>
                </div>
           

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Detalhes</p>
                <p className="whitespace-pre-line">{selectedNotification.details || "Sem Detalhes."}</p>
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
                    <div className="w-full max-h-[300px] overflow-y-auto border rounded-sm">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="p-1">Equipamento</TableHead>
                            <TableHead className="p-1">Nº de Série</TableHead>
                            <TableHead className="p-1">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedNotification.equipment.map((equip, index) => (
                            <TableRow key={index}>
                              <TableCell className="p-1">{equip.name}</TableCell>
                              <TableCell className="py-1">{equip.serialNumber}</TableCell>
                              <TableCell className="py-1">{equip.state}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <Info className="h-6 w-6 mx-auto mb-2" />
                      <p>Nenhum equipamento registado nesta supervisão.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </GenericDetailModal>
        )}
      </div>
    </div>
  )
}
