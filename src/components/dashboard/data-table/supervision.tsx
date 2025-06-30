"use client"

import * as React from "react"
import { format } from "date-fns"
import {  Download,  Shield, Loader2 } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { toast } from "sonner"
import { OccurrencePDF } from "../pdf/occurrence-pdf"
import { Button } from "../../ui/button"
import { DataTable } from "../../ulils/data-table"
import instance from "@/lib/api"
import { GenericDetailModal } from "../generic-detail-modal"
import { ptBR } from "date-fns/locale"
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory"
import { getPriorityLabel } from "./occurrence"

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
        header: ({ column }: { column: any }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Data</span>
        ),
        filterFn: (row: Row<Notification>, id: string, value: string) => {
          if (!value) return true;
          const filter = value.trim().toLowerCase();
          const rowValue = (row.getValue(id) as string).trim().toLowerCase();
          return rowValue.includes(filter);
        },
        size: 90,
      },
      {
        accessorKey: "createdAtTime",
        header: ({ column }: { column: any }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Hora</span>
        ),
        size: 60,
      },
      {
        accessorKey: "siteName",
        header: ({ column }: { column: any }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Site</span>
        ),
        filterFn: (row: Row<Notification>, id: string, value: string) => {
          if (!value) return true;
          const filter = value.trim().toLowerCase();
          const rowValue = (row.getValue(id) as string).trim().toLowerCase();
          return rowValue.includes(filter);
        },
        size: 160,
      },
      {
        accessorKey: "supervisorName",
        header: ({ column }: { column: any }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Supervisor</span>
        ),
        filterFn: (row: Row<Notification>, id: string, value: string) => {
          if (!value) return true;
          const filter = value.trim().toLowerCase();
          const rowValue = (row.getValue(id) as string).trim().toLowerCase();
          return rowValue.includes(filter);
        },
        size: 160,
      },
      {
        accessorKey: "coordinates",
        header: ({ column }: { column: any }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Coordenadas</span>
        ),
        cell: ({ row }: { row: Row<Notification> }) => {
          const value = row.getValue("coordinates") as string
          return value || "-"
        },
        size: 160,
      },
      {
        accessorKey: "tlAbsent",
        header: ({ column }: { column: any }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>TL </span>
        ),
        cell: ({ row }: { row: Row<Notification> }) => {
          const value = row.getValue("tlAbsent") as string
          return value || "-"
        },
        size: 60,
      },
      {
        accessorKey: "time",
        header: ({ column }: { column: any }) => (
          <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Duração</span>
        ),
        cell: ({ row }: { row: Row<Notification> }) => {
          const value = row.getValue("time") as string
          return value || "-"
        },
        size: 80,
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
            type="supervision"
            supervisionData={selectedNotification}
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
          />
        )}
      </div>
    </div>
  )
}
