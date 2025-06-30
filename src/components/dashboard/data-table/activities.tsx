"use client"
import { useState, useMemo } from "react"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Clock, MapPin, User, Shield, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useSupervisionStore } from "@/hooks/useDataStore"
import { useSupervisionData } from "@/hooks/useDataQueries"
import { DataTable } from "@/components/ulils/data-table"
import { GenericDetailModal } from "../generic-detail-modal"
import { isSameDay } from 'date-fns';

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
}

export function ActivityTable() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const { getRecentActivities } = useSupervisionStore()
  const { isLoading } = useSupervisionData()
  const [modalData, setModalData] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activities = getRecentActivities()

  const notifications = useMemo(() => {
    const allActivities = activities
      .map((activity: any) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        createdAt: format(activity.createdAt, "dd/MM/yyyy"),
        createdAtDate: activity.createdAt,
        supervisorName: activity.type === "supervision" ? (activity.data as any).supervisorName : "N/A",
        siteName: activity.data?.siteName || "N/A",
        supervisorCode: activity.type === "supervision" ? (activity.data as any).supervisorCode : undefined,
        type: activity.type,
        equipment: activity.data?.equipment || [],
        workerInformation: activity.data?.workerInformation || [],
      }))
      .sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());

    if (date) {
      return allActivities.filter(item => isSameDay(item.createdAtDate, date));
    }

    // Retorna apenas as 5 supervisões e 5 ocorrências mais recentes se nenhuma data for selecionada
    const supervisions = allActivities.filter(a => a.type === "supervision").slice(0, 5);
    const occurrences = allActivities.filter(a => a.type === "occurrence").slice(0, 5);
    
    return [...supervisions, ...occurrences].sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());

  }, [activities, date]);

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) => <div className="text-sm">{row.getValue("createdAt")}</div>,
      size: 90,
    },
    {
      accessorKey: "createdAtTime",
      header: "Hora",
      cell: ({ row }) => {
        const createdAtDate = row.original.createdAtDate
        return <div className="text-sm font-mono">{format(createdAtDate, "HH:mm")}</div>
      },
      size: 60,
    },
    {
      accessorKey: "siteName",
      header: "Site",
      cell: ({ row }) => <div className="font-medium text-sm">{row.getValue("siteName")}</div>,
      size: 100,
    },
    {
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
      size: 100,
    },
    {
      accessorKey: "supervisorName",
      header: "Supervisor",
      cell: ({ row }) => <div className="text-sm">{row.getValue("supervisorName")}</div>,
    },
  ]

  // Função para abrir modal ao clicar na linha
  const handleViewDetails = (row: any) => {
    setModalData(row)
    setIsModalOpen(true)
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
          footerContent={null}
        />
      )}
    </div>
  )
}
