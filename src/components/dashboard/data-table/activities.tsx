"use client"
import { useState} from "react"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { Shield, AlertTriangle, Download, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useSupervisionStore } from "@/hooks/useDataStore"
import { useSupervisionData } from "@/hooks/useDataQueries"
import { DataTable } from "@/components/ulils/data-table"
import { GenericDetailModal } from "../generic-detail-modal"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { extractColumnsForPDF, extractSectionsFromData, extractSectionsWithTranslations } from "@/lib/pdfUtils"
import { GenericPDF } from "../pdf/genericPDF"


export type Notification = {
  id: string
  title: string
  description: string
  createdAt: string
  createdAtDate: Date
  supervisorName: string
  siteName: string
  type: "supervision" | "occurrence"
  costCenter?: string
  supervisorCode?: string
  equipment: any[]
  workerInformation: any[]
  data: any
}

const sectionTranslations = {
  equipment: {
    title: "Equipamentos",
    fields: {
      name: "Nome",
      serialNumber: "Número de Série",
      state: "Estado",
      costCenter: "Centro de Custo",
      obs: "Observação"
    }
  },
  workerInformation: {
    title: "Trabalhadores",
    fields: {
      name: "Nome",
      employeeNumber: "Matrícula",
      state: "Estado",
      obs: "Observação"
    }
  }
}

export function ActivityTable() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const { getRecentActivities } = useSupervisionStore()
  const { isLoading } = useSupervisionData()
  const [modalData, setModalData] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activities = getRecentActivities()
  const supervisions = activities.filter(a => a.type === "supervision")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
  const occurrences = activities.filter(a => a.type === "occurrence")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
  const notifications: Notification[] = [...supervisions, ...occurrences]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((activity: any) => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      createdAt: format(activity.createdAt, "dd/MM/yyyy"),
      createdAtDate: activity.createdAt,
      supervisorName: activity.type === "supervision" ? (activity.data as any).supervisorName : "N/A",
      siteName: activity.type === "supervision" ? (activity.data as any).siteName : (activity.data as any).siteName,
      supervisorCode: activity.type === "supervision" ? (activity.data as any).supervisorCode : undefined,
      type: activity.type,
      equipment: activity.data?.equipment || [],
      workerInformation: activity.data?.workerInformation || [],
      data: activity.data,
    }))

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }: { column: any }) => (
        <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Data</span>
      ),
    },
    {
      id: "createdAtTime",
      header: "Hora",
      cell: ({ row }) => {
        const createdAtDate = row.original.createdAtDate
        return <span >{format(createdAtDate, "HH:mm")}</span>
      },
    },
    {
      id: "siteName",
      accessorKey: "siteName",
      header: "Site",
      cell: ({ row }) => <div className="text-sm">{row.getValue("siteName")}</div>,
    },
    {
      id: "reportType",
      header: "Relatório",
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <span className="text-sm font-semibold">
            {type === "supervision" ? "Supervisão" : type === "occurrence" ? "Ocorrência" : type}
          </span>
        )
      },
      size: 120,
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Atividade",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        const activity =
          type === "supervision"
            ? "Supervisão"
            : type === "occurrence"
            ? "Ocorrência"
            : type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
        return (
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {activity}
          </span>
        )
      },
      size: 100,
    },
    {
      id: "supervisorName",
      accessorKey: "supervisorName",
      header: "Supervisor",
      cell: ({ row }) => <span className="text-sm">{row.getValue("supervisorName")}</span>,
    },
  ]

  const handleViewDetails = (row: any) => {
    setModalData(row)
    setIsModalOpen(true)
  }
  let footerContent = null
  if (modalData) {
    footerContent = (
      <PDFDownloadLink
        document={
          <GenericPDF
            title={modalData.type === "occurrence" ? "Relatório de Ocorrência" : "Relatório de Supervisão"}
            columns={extractColumnsForPDF(columns)}
            data={{
              ...modalData.data,
              siteName: modalData.siteName,
              supervisorName: modalData.supervisorName,
              createdAt: modalData.createdAt,
              createdAtTime: format(modalData.createdAtDate, "HH:mm"),
              priority: (modalData.data as any)?.priority,
            }}
            detailsField={modalData.type === "occurrence" ? "description" : undefined}
            sections={extractSectionsWithTranslations({
              ...modalData.data,
              siteName: modalData.siteName,
              supervisorName: modalData.supervisorName,
              createdAt: modalData.createdAt,
              createdAtTime: format(modalData.createdAtDate, "HH:mm"),
              priority: (modalData.data as any)?.priority,
            }, sectionTranslations)}
          />
        }
        fileName={`${modalData.type}-${modalData.siteName ?? "local"}-${modalData.id}.pdf`}
        style={{ textDecoration: "none" }}
      >
        {({ loading: pdfLoading }) => (
          <Button variant="outline" disabled={pdfLoading} className="cursor-pointer">
            {pdfLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {modalData.type === "occurrence" ? "Baixar Relatório de Ocorrência" : "Baixar Relatório de Supervisão"}
          </Button>
        )}
      </PDFDownloadLink>
    )
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Últimas Atividades</h3>
      </div>
      <DataTable
        columns={columns}
        data={notifications}
        loading={isLoading}
        filterOptions={{
          enableDateFilter: true,
          enableColumnVisibility: true,
        }}
        date={date}
        setDate={setDate}
        initialColumnVisibility={{
          createdAtTime: true,
        }}
        handleViewDetails={handleViewDetails}
      />
      {modalData && (
        <GenericDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalData.type === "supervision" ? "Detalhes da Supervisão" : "Detalhes da Ocorrência"}
          icon={modalData.type === "supervision" ? Shield : AlertTriangle}
          type={modalData.type}
          occurrenceData={modalData.type === "occurrence" ? modalData : undefined}
          supervisionData={modalData.type === "supervision" ? modalData : undefined}
          footerContent={footerContent}
        />
      )}
    </div>
  )
}
