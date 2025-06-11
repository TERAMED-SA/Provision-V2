"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { DataTable } from "../../ulils/data-table"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import instance from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"


export type Notification = {
  id: string
  title: string
  description: string
  createdAt: string
  createdAtDate: Date
  supervisorName: string
  siteName: string
  costCenter?: string
  supervisorCode?: string
}

export function ActivityTable() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const user = useAuth();
        if (!user) {
          setLoading(false);
          return;
        }

        const data = await instance.get(`/notification/${user}?size=5000`);
        console.log(data);

        const formattedNotifications = data.data.map((notification: any) => ({
          ...notification,
          createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
          createdAtDate: new Date(notification.createdAt),
          supervisorName: "Carregando...",
          siteName: "Carregando...",
        }));

        const sortedNotifications = formattedNotifications.sort(
          (a: Notification, b: Notification) =>
            b.createdAtDate.getTime() - a.createdAtDate.getTime()
        );

        setNotifications(sortedNotifications);

        fetchSiteData(sortedNotifications);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        toast.error("Não foi possível carregar as notificações");
        setLoading(false);
      }
    };

    const fetchSiteData = async (currentNotifications: Notification[]) => {
      try {
        const response = await instance.get(`/admin/metrics?size=10&page=1`);
        
        if (!response.ok) {
          throw new Error(response.message || "Erro ao buscar dados dos sites");
        }

        updateNotificationsWithMetrics(response.data.sites, currentNotifications);
      } catch (error) {
        console.error("Erro ao buscar métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const updateNotificationsWithMetrics = (
    metrics: any[],
    currentNotifications: Notification[]
  ) => {
    const updated = currentNotifications.map((notification) => {
      const metricSite = metrics.find(
        (site) => site.siteCostcenter === notification.costCenter
      );

      if (metricSite) {
        const supervisor =
          metricSite.supervisor &&
          metricSite.supervisor.employeeId === notification.supervisorCode
            ? metricSite.supervisor.name
            : "Não encontrado";

        return {
          ...notification,
          supervisorName: supervisor || "Sem supervisor",
          siteName: metricSite.siteName || "Sem site",
        };
      }
      return notification;
    });

    setNotifications(updated);
  };

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("createdAt")}</div>,
    },
    {
      accessorKey: "siteName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome do Site
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("siteName")}</div>,
    },
    {
      accessorKey: "supervisorName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Supervisor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("supervisorName")}</div>,
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "createdAtTime",
      header: "Hora",
      cell: ({ row }) => {
        const createdAtDate = row.original.createdAtDate;
        return <div>{format(createdAtDate, "HH:mm")}</div>;
      },
    }
  ];
  
  return (
    <div className="">
      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        title="Últimas Atividades"
        filterOptions={{
          enableSupervisorFilter: true,
        }}
        date={date}
        setDate={setDate}
        initialColumnVisibility={{
          createdAtTime: false,
        }}
      />
    </div>
  )
}