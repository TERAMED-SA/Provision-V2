"use client"
import { useState } from "react"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Clock, MapPin, User, Shield, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useSupervisionStore } from "@/hooks/useDataStore"
import { useSupervisionData } from "@/hooks/useDataQueries"
import { DataTable } from "@/components/ulils/data-table"


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
}

export function ActivityTable() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const { getRecentActivities } = useSupervisionStore()
  const { isLoading } = useSupervisionData()

  // Filtrar 2 supervisões + 1 ocorrência mais recente, todos ordenados por data/hora
  const activities = getRecentActivities()
  const supervisions = activities.filter(a => a.type === "supervision")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
  const occurrences = activities.filter(a => a.type === "occurrence")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
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
    }))

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <span className="flex items-center gap-2 text-xs font-semibold py-1">
            {type === "supervision" ? (
              <Shield className="w-4 h-4 text-blue-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            {type === "supervision" ? "Supervisão" : "Ocorrência"}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Clock className="mr-2 h-4 w-4" />
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-sm">{row.getValue("createdAt")}</div>,
    },
    {
      accessorKey: "siteName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <MapPin className="mr-2 h-4 w-4" />
            Site
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium text-sm">{row.getValue("siteName")}</div>,
    },
    {
      accessorKey: "supervisorName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <User className="mr-2 h-4 w-4" />
            Supervisor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-sm">{row.getValue("supervisorName")}</div>,
    },
    {
      accessorKey: "createdAtTime",
      header: "Hora",
      cell: ({ row }) => {
        const createdAtDate = row.original.createdAtDate
        return <div className="text-sm font-mono">{format(createdAtDate, "HH:mm")}</div>
      },
    },
  ]

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
          enableSupervisorFilter: true,
        }}
        date={date}
        setDate={setDate}
        initialColumnVisibility={{
          createdAtTime: true,
        }}
      />
    </div>
  )
}
