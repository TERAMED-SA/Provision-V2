"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowUpDown, Download, Eye } from "lucide-react";
import { DataTable } from "../../ulils/data-table";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import { OccurrencePDF } from "../pdf/occurrence-pdf";
import type { Column, Row } from "@tanstack/react-table";
import { BreadcrumbRoutas } from "../../ulils/breadcrumbRoutas";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import instance from "@/lib/api";

export type Notification = {
  _id: string;
  idNotification?: string;
  createdAt: string;
  createdAtTime: string;
  createdAtDate: Date;
  siteName: string;
  costCenter: string;
  supervisorName: string;
  priority: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  details: string;
  numberOfWorkers?: number;
  workerInformation?: WorkerInfo[];
  equipment?: Equipment[];
};

type WorkerInfo = {
  name: string;
  employeeNumber: string;
  state: string;
  obs?: string;
};

type Equipment = {
  name: string;
  serialNumber: string;
  state: string;
  costCenter: string;
  obs?: string;
};

const PriorityBadge = ({
  priority,
}: {
  priority: Notification["priority"];
}) => {
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
  };

  const config = priorityConfig[priority] || {
    variant: "outline",
    className: "bg-gray-100 text-gray-800",
    label: priority ?? "Desconhecido",
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case "BAIXA":
      return "Baixa";
    case "MEDIA":
      return "Média";
    case "ALTA":
      return "Alta";
    case "CRITICA":
      return "Crítica";
    default:
      return priority;
  }
};

export const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case "BAIXA":
      return "bg-green-100 text-green-800";
    case "MEDIA":
      return "bg-yellow-100 text-yellow-800";
    case "ALTA":
      return "bg-orange-100 text-orange-800";
    case "CRITICA":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function OccurrenceTable() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [metricsData, setMetricsData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<Notification[]>([]);
  const [dataInitialized, setDataInitialized] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await instance.get(`/occurrence?size=100`);
      const formattedNotifications = response.data.data.data.map(
        (notification: any) => ({
          ...notification,
          createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
          createdAtTime: format(new Date(notification.createdAt), "HH:mm"),
          createdAtDate: new Date(notification.createdAt),
          supervisorName: notification.supervisorName || "Carregando...",
          siteName: notification.name || "Carregando...",
        })
      );
      setNotifications(formattedNotifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
      toast.error("Erro ao carregar ocorrências");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMetrics = React.useCallback(async () => {
    try {
      const response = await instance.get(`/admin/metrics?size=100&page=1`);
      setMetricsData(response.data.data.sites);
    } catch (error: any) {
      console.error("Error fetching metrics:", error.message);
      toast.error("Erro ao carregar métricas");
    }
  }, []);

  const updateNotificationsWithMetrics = React.useCallback(
    (notifs: Notification[], metrics: any[]) => {
      return notifs.map((notification) => {
        const metricSite = metrics.find(
          (site) => site.siteCostcenter === notification.costCenter
        );
        if (metricSite) {
          const supervisorName = metricSite.supervisor
            ? metricSite.supervisor.name
            : "Não encontrado";
          return {
            ...notification,
            supervisorName: supervisorName,
            siteName:
              metricSite.siteName || notification.siteName || "Sem site",
          };
        }
        return notification;
      });
    },
    []
  );

  React.useEffect(() => {
    const loadInitialData = async () => {
      await fetchNotifications();
      await fetchMetrics();
    };
    loadInitialData();
  }, [fetchNotifications, fetchMetrics]);

  React.useEffect(() => {
    if (notifications.length > 0 && !dataInitialized) {
      const sorted = [...notifications].sort(
        (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
      );
      setData(sorted);
      setDataInitialized(true);
    }
  }, [notifications, dataInitialized]);

  React.useEffect(() => {
    if (notifications.length > 0 && metricsData.length > 0) {
      const updatedNotifications = updateNotificationsWithMetrics(
        notifications,
        metricsData
      );
      const sorted = [...updatedNotifications].sort(
        (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
      );
      setData(sorted);
    }
  }, [
    notifications,
    metricsData,
    updateNotificationsWithMetrics,
    updateNotificationsWithMetrics,
  ]);

  const handleViewDetails = React.useCallback(
    (notification: Notification) => {
      try {
        if (!notification || !notification._id) {
          toast.error("Dados da ocorrência inválidos");
          return;
        }

        const url = `/dashboard/occurrence/${notification._id}`;
        router.push(url);
      } catch (error) {
        console.error("Erro ao navegar para detalhes:", error);
        toast.error("Erro ao abrir detalhes da ocorrência");
      }
    },
    [router]
  );

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "idNotification",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button variant="ghost">ID</Button>
        ),
        cell: ({ row }: { row: Row<Notification> }) => {
          return (
            <div className="max-w-[100px] truncate" title={`#${row.index + 1}`}>
              {row.index + 1}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "createdAtTime",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Hora
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        filterFn: (row: Row<Notification>, id: string, value: string) => {
          if (!value) return true;
          const rowDate = row.getValue(id) as string;
          const [day, month, year] = rowDate
            .split("/")
            .map((n) => Number.parseInt(n, 10));
          const date = new Date(year, month - 1, day);
          return format(date, "yyyy-MM-dd") === value;
        },
      },
      {
        accessorKey: "siteName",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Site
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "supervisorName",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Supervisor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "details",
        header: "Detalhes",
        cell: ({ row }: { row: Row<Notification> }) => {
          const details = row.getValue("details") as string;
          return (
            <div className="max-w-[200px] truncate" title={details}>
              {details}
            </div>
          );
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }: { column: Column<Notification, unknown> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Prioridade
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: { row: Row<Notification> }) => (
          <PriorityBadge priority={row.getValue("priority")} />
        ),
        filterFn: (row: Row<Notification>, id: string, value: string[]) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }: { row: Row<Notification> }) => {
          const notification = row.original;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-gray-600 hover:text-green-900 hover:bg-green-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewDetails(notification);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>

              <PDFDownloadLink
                document={
                  <OccurrencePDF
                    notification={notification}
                    getPriorityLabel={getPriorityLabel}
                  />
                }
                fileName={`ocorrencia-${notification.siteName}-${notification._id}.pdf`}
                style={{ textDecoration: "none" }}
              >
                {({ loading: pdfLoading }: { loading: boolean }) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-blue-600 hover:text-blue-900 hover:bg-blue-100"
                    disabled={pdfLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          );
        },
      },
    ],
    [handleViewDetails]
  );

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
          title="Ocorrências"
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
      </div>
    </div>
  );
}
