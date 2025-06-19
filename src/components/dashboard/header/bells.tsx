"use client";

import { useMemo, useState } from "react";
import { Bell, Eye } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "../../ui/badge";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Bells() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);


  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'supervision') {
      // Dispatch event first to ensure modal opens
      window.dispatchEvent(new CustomEvent('view-supervisor-detail', { 
        detail: notification.data 
      }));
      // Then navigate
      router.push(`/dashboard/supervisao?id=${notification.id}`);
    } else if (notification.type === 'occurrence') {
      // Dispatch event first to ensure modal opens
      window.dispatchEvent(new CustomEvent('view-occurrence-detail', { 
        detail: notification.data 
      }));
      // Then navigate
      router.push(`/dashboard/ocorrencias?id=${notification.id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'supervision':
        return '🛡️';
      case 'occurrence':
        return '';
      default:
        return '';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'supervision':
        return 'bg-blue-50  dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'occurrence':
        return 'bg-red-50  dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50  dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  const formatTimeAgo = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: ptBR });
    } else if (isYesterday(date)) {
      return "Ontem";
    } else {
      return format(date, "dd/MM", { locale: ptBR });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
     <div>
      df
     </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-[500px] overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
        align="center"
        sideOffset={12}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificações
            </h3>
           
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
         
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}