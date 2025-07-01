"use client"

import * as React from "react"
import { format } from "date-fns"
import { DataTable } from "../../ulils/data-table"
import { toast } from "sonner"
import type { Column, Row } from "@tanstack/react-table"
import { Badge } from "../../ui/badge"
import type { Occurrence } from "@/features/application/domain/entities/Occurrence"
import { GenericDetailModal } from "../generic-detail-modal"
import instance from "@/lib/api"
import { ptBR } from "date-fns/locale"
import { AlertTriangle } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { OccurrencePDF } from "../pdf/occurrence-pdf"
import { Download, Loader2 } from "lucide-react"

export type Notification = Occurrence

const PriorityBadge = ({ priority }: { priority: Notification["priority"] }) => {
  const priorityConfig = {
    BAIXA: {
      variant: "outline",
      className: "bg-green-100 text-green-800",
      label: "Baixa",
    },
    MEDIA: {
      variant: "outline",
      className: "bg-yellow-100 text-yellow-800",
      label: "Média",
    },
    ALTA: {
      variant: "outline",
      className: "bg-orange-100 text-orange-800",
      label: "Alta",
    },
    CRITICA: {
      variant: "outline",
      className: "bg-red-100 text-red-800",
      label: "Crítica",
    },
  }

  const config = priorityConfig[priority] || {
    variant: "outline",
    className: "bg-gray-100 text-gray-800",
    label: priority ?? "Desconhecido",
  }

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

export const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case "BAIXA":
      return "Baixa"
    case "MEDIA":
      return "Média"
    case "ALTA":
      return "Alta"
    case "CRITICA":
      return "Crítica"
    default:
      return priority
  }
}

export const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case "BAIXA":
      return "bg-green-100 text-green-800"
    case "MEDIA":
      return "bg-yellow-100 text-yellow-800"
    case "ALTA":
      return "bg-orange-100 text-orange-800"
    case "CRITICA":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function OccurrenceTable() {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [data, setData] = React.useState<Notification[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [sitesMap, setSitesMap] = React.useState<Map<string, any>>(new Map())
  const [supervisors, setSupervisors] = React.useState<Map<string, string>>(new Map())
  const pageSize = 10000
  const fetchOccurrences = React.useCallback(
       async (page = 1000, supervisorMap?: Map<string, string>) => {
      try {
        setIsLoading(true)
        const response = await instance.get(`/occurrence?page=${page}&size=${pageSize}`)

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
               return {
              ...notification,
              createdAt: formattedDate,
              createdAtTime: formattedTime,
              createdAtDate: createdAtDate,
              siteName: notification.name || "Site não informado",
              coordinates: notification.coordinates || "-",
              duration: notification.duration || "-",
            }
          })
          .sort((a: Notification, b: Notification) => b.createdAtDate.getTime() - a.createdAtDate.getTime())

        setData(formattedNotifications)


      } catch (error: any) {
        console.error("Erro ao buscar ocorrências:", error)
        toast.error("Erro ao carregar ocorrências")
      } finally {
        setIsLoading(false)
      }
    },
    [sitesMap, pageSize],
  )

  React.useEffect(() => {
    const loadInitialData = async () => {
      await fetchOccurrences(1)
    }

    loadInitialData()
  }, [])

 
  const handleViewDetails = React.useCallback((notification: Notification) => {
    if (!notification || !notification._id) {
      toast.error("Dados da ocorrência inválidos")
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
        size: 90,
        minSize: 90,
        maxSize: 90,
        enableResizing: false,
      },
      {
        accessorKey: "createdAtTime",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <span  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Hora
          </span>
        ),
        filterFn: (row: Row<Notification>, id: string, value: string) => {
          if (!value) return true
          const rowDate = row.getValue(id) as string
          const [day, month, year] = rowDate.split("/").map((n) => Number.parseInt(n, 10))
          const date = new Date(year, month - 1, day)
          return format(date, "yyyy-MM-dd") === value
        },
        size: 70,
        minSize: 70,
        maxSize: 70,
        enableResizing: false,
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
        accessorKey: "coordenadas",
        header: "Coordenadas",
        cell: ({ row }: { row: Row<Notification> }) => {
          const lat = row.original.latitude
          const lng = row.original.longitude
          return lat && lng ? `${lat}, ${lng}` : "-"
        },
      },
      {
        accessorKey: "aria",
        header: "Área",
        cell: ({ row }: { row: Row<Notification> }) => {
          return row.original.aria || "-"
        },
      },
      {
        accessorKey: "ocorrencia",
        header: "Ocorrência",
        cell: ({ row }: { row: Row<Notification> }) => {
          return row.original.ocorrencia || "-"
        },
      },
    ],
    [handleViewDetails],
  )

  return (
    <div className="grid grid-cols-1 gap-6">

      <div className="col-span-1 md:col-span-2">
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          title="Ocorrências"
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
      </div>

      <GenericDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalhes da Ocorrência"
        icon={AlertTriangle}
        type="occurrence"
        occurrenceData={selectedNotification || undefined}
        getPriorityLabel={getPriorityLabel}
        priorityColor={selectedNotification ? getPriorityClass(selectedNotification.priority) : undefined}
        footerContent={selectedNotification && (
          <PDFDownloadLink
            document={<OccurrencePDF notification={selectedNotification} getPriorityLabel={getPriorityLabel} />}
            fileName={`ocorrencia-${selectedNotification?.siteName}-${selectedNotification?._id}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading: pdfLoading }) => (
              <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {pdfLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Baixar PDF
              </button>
            )}
          </PDFDownloadLink>
        )}
      />
    </div>
  )
}
