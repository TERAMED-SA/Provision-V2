"use client"
import { useState } from "react"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { Shield, AlertTriangle, Download, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useSupervisionStore } from "@/hooks/useDataStore"
import { useSupervisionData } from "@/hooks/useDataQueries"
import { DataTable } from "@/components/ulils/data-table"
import { GenericDetailModal } from "../generic-detail-modal"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { OccurrencePDF } from "../pdf/occurrence-pdf"
import { getPriorityLabel } from "./occurrence"


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
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) => <span >{row.getValue("createdAt")}</span>,
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
      cell: ({ row }) => <span>{row.getValue("siteName")}</span>,
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
          <span className="flex items-center gap-2 text-xs font-semibold ">
            {activity}
          </span>
        )
      },
    },
    {
      id: "supervisorName",
      accessorKey: "supervisorName",
      header: "Supervisor",
      cell: ({ row }) => <span className="text-sm">{row.getValue("supervisorName")}</span>,
    },
  ]

  // Função para abrir modal ao clicar na linha
  const handleViewDetails = (row: any) => {
    setModalData(row)
    setIsModalOpen(true)
  }

  const footerContent = modalData ? (
    <PDFDownloadLink
      document={
        <OccurrencePDF
          notification={{
            ...(modalData.data as any),
            _id: modalData.id,
            priority: modalData.type === "supervision" ? "BAIXA" : (modalData.data as any)?.priority,
          }}
          getPriorityLabel={getPriorityLabel}
        />
      }
      fileName={`${modalData.type}-${modalData.siteName ?? "local"}-${modalData.id}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading: pdfLoading }) => (
        <Button variant="outline" disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Baixar PDF
        </Button>
      )}
    </PDFDownloadLink>
  ) : null

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
