"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  Menu,
  Phone,
  Video,
  PaperclipIcon,
  Send,
  Smile,
  MoreVertical,
  Search,
  Settings,
  UserPlus,
  Wifi,
  WifiOff,
} from "lucide-react"
import UserStatus from "./user-status"
import ChatMessage from "./chat-message"
import FileUploadDialog from "./file-upload-dialog"
import ContactList from "./contact-list"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { ScrollArea } from "../../ui/scroll-area"
import { Sheet, SheetContent } from "../../ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Textarea } from "../../ui/textarea"
import { CurrentUser, Supervisor } from "@/types/chat"
import { useChat } from "@/hooks/use-chat"
import { socketManager } from "@/lib/socket"



interface ChatInterfaceProps {
  currentUser: CurrentUser
}

export default function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [activeChat, setActiveChat] = useState("")
  const [activeSupervisor, setActiveSupervisor] = useState<Supervisor | null>(null)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showFileDialog, setShowFileDialog] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isDesktop, setIsDesktop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 868)
      setIsMobile(window.innerWidth <= 640)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const {
    contacts,
    availableSupervisors,
    messages,
    isLoading,
    isConnected,
    typingUsers,
    addContact,
    removeContact,
    fetchMessages,
    sendMessage,
    deleteMessage,
    updateMessage,
    setMessages,
  } = useChat({ currentUser })

  const filteredContacts = React.useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [contacts, searchQuery],
  )

  const canSendMessage = newMessage.trim().length > 0 && isConnected && activeChat

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [messages.length])

  // Handle typing indicators
  useEffect(() => {
    if (newMessage.length > 0) {
      setShowEmptyWarning(false)

      if (activeChat) {
        socketManager.emitTyping(`${currentUser.employeeId}-${activeChat}`, currentUser.employeeId)

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(() => {
          socketManager.emitStoppedTyping(`${currentUser.employeeId}-${activeChat}`, currentUser.employeeId)
        }, 1000)
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [newMessage, activeChat, currentUser.employeeId])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [setMessages])

  const handleSetActiveChat = useCallback(
    (employeeId: string, supervisor: Supervisor) => {
      console.log("Switching to chat:", { employeeId, supervisor: supervisor.name })
      setMessages([])
      setActiveChat(employeeId)
      setActiveSupervisor(supervisor)
      fetchMessages(employeeId)

      socketManager.joinChatRoom(`${currentUser.employeeId}-${employeeId}`)

      if (!isDesktop) {
        setSidebarOpen(false)
      }
    },
    [fetchMessages, currentUser.employeeId, isDesktop, setMessages],
  )

  const handleSendMessage = useCallback(
    async (e: React.FormEvent, file?: File) => {
      e.preventDefault()

      if (newMessage.trim() === "" && !file) {
        setShowEmptyWarning(true)
        setTimeout(() => setShowEmptyWarning(false), 3000)
        return
      }

      if (!activeChat) {
        toast.error("Selecione um chat primeiro")
        return
      }

      const messageContent = newMessage
      setNewMessage("") 

      await sendMessage(messageContent, activeChat, file)

      socketManager.emitStoppedTyping(`${currentUser.employeeId}-${activeChat}`, currentUser.employeeId)
    },
    [newMessage, activeChat, sendMessage, currentUser.employeeId],
  )

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      await deleteMessage(messageId)
    },
    [deleteMessage],
  )

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      await updateMessage(messageId, newContent)
    },
    [updateMessage],
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      handleSendMessage(new Event("submit") as any, file)
    },
    [handleSendMessage],
  )

  useEffect(() => {
    if (!activeChat) {
      clearMessages()
    }
  }, [activeChat, clearMessages])

  const renderSidebar = () => (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg?height=40&width=40"} alt="User" />
            <AvatarFallback className="text-sm font-medium">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{currentUser.name}</h3>
            <div className="flex items-center gap-2">
              <UserStatus status="online" />
              {isConnected ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar contatos..."
            className="pl-10 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="contacts" className="flex flex-col min-h-0 px-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="contacts" className="text-sm">
            Contatos
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-sm">
            Grupos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="flex-1 min-h-0 mt-4">
          <ScrollArea className="h-full">
            <ContactList
              contacts={filteredContacts}
              availableSupervisors={availableSupervisors}
              activeChat={activeChat}
              setActiveChat={handleSetActiveChat}
              onAddContact={addContact}
              onRemoveContact={removeContact}
              isLoading={isLoading}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="groups" className="flex-1 min-h-0 mt-4">
          <ScrollArea className="h-full">
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">Funcionalidade em desenvolvimento</p>
              <Button variant="outline" size="sm" disabled className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Grupo
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <div className="flex bg-background dark:bg-gray-800 overflow-hidden h-full ">
      {isDesktop ? (
        <div className="w-80 border-r h-full shrink-0 dark:bg-gray-900">{renderSidebar()}</div>
      ) : (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[400px] max-w-[90vw] dark:bg-gray-900">
            {renderSidebar()}
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col h-full min-w-0 dark:bg-gray-800">
        {activeSupervisor ? (
          <>
            <div className="border-b p-4 flex items-center justify-between shrink-0 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {!isDesktop && (
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="shrink-0 h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={activeSupervisor.avatar || "/placeholder.svg?height=40&width=40"}
                      alt={activeSupervisor.name}
                    />
                    <AvatarFallback className="text-sm font-medium">
                      {activeSupervisor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-base truncate">{activeSupervisor.name}</h3>
                    <div className="flex items-center gap-2">
                      <UserStatus status={activeSupervisor.status} />
                      {typingUsers.has(activeSupervisor.employeeId) && (
                        <span className="text-sm text-blue-600 animate-pulse">digitando...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="h-4 w-4" />
                </Button>
                {!isMobile && (
                  <>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 relative bg-gray-50 dark:bg-gray-800">
              <ScrollArea className="h-full dark:bg-gray-800">
                <div className="p-4 space-y-4 ">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onDelete={handleDeleteMessage}
                      onEdit={handleEditMessage}
                    />
                  ))}
                  {showEmptyWarning && (
                    <div className="flex justify-center my-4">
                      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                        <span className="text-sm text-yellow-800">Mensagem vazia não pode ser enviada</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="border-t p-4 shrink-0 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  onClick={() => setShowFileDialog(true)}
                >
                  <PaperclipIcon className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative min-w-0">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className={`min-h-[44px] max-h-32 resize-none pr-12 ${showEmptyWarning ? "border-red-300 focus:border-red-500" : ""}`}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 bottom-2 h-8 w-8">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className={`shrink-0 h-10 w-10 transition-colors ${
                    canSendMessage ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
                  }`}
                  disabled={!canSendMessage}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Menu className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione um contato</h3>
              <p className="text-gray-600">Adicione e escolha um supervisor da lista para iniciar uma conversa</p>
              {!isDesktop && (
                <Button onClick={() => setSidebarOpen(true)} className="mt-4" variant="outline">
                  <Menu className="mr-2 h-4 w-4" />
                  Ver Contatos
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <FileUploadDialog open={showFileDialog} onOpenChange={setShowFileDialog} onFileSelect={handleFileSelect} />
    </div>
  )
}
