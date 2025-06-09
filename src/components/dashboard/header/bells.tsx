"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../../ui/badge";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";

export function Bells() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getUser();
        if (!user) return;

        const response = await instance.get(`/notification/${user}?size=50`);

        if (response.status !== 200) {
          throw new Error(response.statusText || "Erro ao buscar notificações");
        }

        setNotifications(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    fetchData();
  }, []);

  const hasNotifications = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer p-2 hover:bg-muted rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <Badge
              className="absolute top-0 -right-1.5 h-4 w-4 p-0 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold"
              variant="default"
            >
              {notifications.length}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-60 max-h-96 overflow-auto rounded-xl shadow-xl"
        align="center"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">
          Notificações
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start px-2 py-2 gap-0.5 hover:bg-muted transition-colors"
              >
                <span className="text-sm font-semibold text-primary">
                  {notification.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {notification.description}
                </span>
                <span className="text-[10px] text-muted-foreground italic">
                  {notification.siteName} — {notification.supervisorName} —{" "}
                  {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="text-sm text-muted-foreground">
              Sem novas notificações.
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
