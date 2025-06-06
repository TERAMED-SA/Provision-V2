"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/components/ui/avatar"
import { Badge } from "@/src/ui/components/ui/badge"
import { cn } from "@/src/lib/utils"
import UserStatus from "./user-status"
import { Supervisor } from "@/src/types/chat"
import { Button } from "@/src/ui/components/ui/button"
import { UserPlus, X } from "lucide-react"
import { useState } from "react"


interface ContactListProps {
  contacts: Supervisor[]
  availableSupervisors: Supervisor[]
  activeChat: string
  setActiveChat: (employeeId: string, supervisor: Supervisor) => void
  onAddContact: (supervisor: Supervisor) => void
  onRemoveContact: (employeeId: string) => void
  showLastMessage?: boolean
  isLoading?: boolean
  isSwitchingChat?: boolean
}

export default function ContactList({
  contacts,
  activeChat,
  setActiveChat,
  onRemoveContact,
  showLastMessage = true,
  isLoading = false,
}: ContactListProps) {

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleSupervisorClick = (supervisor: Supervisor) => {
    console.log("Supervisor selected:", {
      name: supervisor.name,
      employeeId: supervisor.employeeId,
      mecCoordinator: supervisor.mecCoordinator,
    })
    setActiveChat(supervisor.employeeId, supervisor)
  }

  return (
    <div className="space-y-3">
    

      {contacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Nenhum contato adicionado</p>
          <p className="text-muted-foreground text-xs mt-1">Clique em "Adicionar Supervisor" para começar</p>
        </div>
      ) : (
        contacts.map((supervisor) => (
          <div
            key={supervisor.employeeId}
            className={cn(
              "flex items-center gap-2 sm:gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors min-h-0 group",
              activeChat === supervisor.employeeId && "bg-blue-100",
            )}
          >
            <div
              className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
              onClick={() => handleSupervisorClick(supervisor)}
            >
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
                  <AvatarFallback className="text-sm">
                    {supervisor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {supervisor.status === "online" && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                )}
                {supervisor.status === "away" && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-yellow-500 border-2 border-background"></span>
                )}
                {supervisor.status === "busy" && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-background"></span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium truncate text-xs sm:text-sm">{supervisor.name}</h4>
                  <span className="text-xs text-muted-foreground shrink-0">{supervisor.lastMessageTime}</span>
                </div>

                {showLastMessage && (
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-muted-foreground truncate flex-1 leading-relaxed">
                      {supervisor.lastMessage || "Nenhuma mensagem ainda"}
                    </p>
                    {supervisor.unreadCount && supervisor.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="shrink-0 p-1 min-w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700"
                      >
                        {supervisor.unreadCount}
                      </Badge>
                    )}
                  </div>
                )}

                {!showLastMessage && (
                  <div className="mt-1">
                    <UserStatus status={supervisor.status} />
                  </div>
                )}
              </div>
            </div>

          
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveContact(supervisor.employeeId)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}

 
 
    </div>
  )
}
