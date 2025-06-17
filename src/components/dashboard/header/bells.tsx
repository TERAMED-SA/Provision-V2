"use client";

import { useMemo, useState } from "react";
import { Bell, Eye } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "../../ui/badge";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { cn } from "@/lib/utils";

export function Bells() {
  const router = useRouter();
  const { notifications } = useRealTimeUpdates();
  const [showAll, setShowAll] = useState(false);

  const displayedNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return showAll ? sorted : sorted.slice(0, 6);
  }, [notifications, showAll]);

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
        <div className="relative cursor-pointer p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {notifications.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-7 w-7 p-0 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold border-2 border-white dark:border-gray-900 shadow-sm"
              variant="default"
            >
              {notifications.length > 99 ? '99+' : notifications.length}
            </Badge>
          )}
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
            {notifications.length > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs"
              >
                {notifications.length}
              </Badge>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            <DropdownMenuGroup className="p-2">
              {displayedNotifications.map((notification, index) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start p-3 rounded-xl mb-2 last:mb-0 border transition-all duration-200 hover:shadow-sm cursor-pointer",
                    getNotificationColor(notification.type),
                    "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 text-xl mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatTimeAgo(new Date(notification.createdAt))}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <span className="truncate max-w-20">{notification.siteName}</span>
                        <span>•</span>
                        <span className="truncate max-w-20">{notification.supervisorName}</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              
              {notifications.length > 6 && !showAll && (
                <div className="pt-2 pb-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAll(true);
                    }}
                    className="w-full p-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800"
                  >
                    <Eye className="h-4 w-4" />
                    Ver mais {notifications.length - 6} notificações
                  </button>
                </div>
              )}
            </DropdownMenuGroup>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Nenhuma notificação
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Você está em dia com tudo!
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}