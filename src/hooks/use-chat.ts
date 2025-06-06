"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import instance from "../lib/api"
import type { CurrentUser, Message, Supervisor } from "../types/chat"
import { socketManager } from "../lib/socket"

interface UseChatProps {
  currentUser: CurrentUser
}

export function useChat({ currentUser }: UseChatProps) {
  const [allSupervisors, setAllSupervisors] = useState<Supervisor[]>([])
  const [contacts, setContacts] = useState<Supervisor[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const currentUserRef = useRef(currentUser.employeeId)
  const socketInitialized = useRef(false)

  // Validate currentUser
  useEffect(() => {
    if (!currentUser.employeeId || currentUser.employeeId.trim() === "") {
      console.error("Invalid currentUser: employeeId is required")
      toast.error("Erro: ID do usuário não encontrado")
      return
    }
    currentUserRef.current = currentUser.employeeId
  }, [currentUser.employeeId])

  const saveContactsToStorage = useCallback(
    (contactsToSave: Supervisor[]) => {
      try {
        localStorage.setItem(`chat-contacts-${currentUser.employeeId}`, JSON.stringify(contactsToSave))
      } catch (error) {
        console.error("Error saving contacts to storage:", error)
      }
    },
    [currentUser.employeeId],
  )

  const loadContactsFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(`chat-contacts-${currentUser.employeeId}`)
      if (saved) {
        const parsedContacts = JSON.parse(saved)
        setContacts(parsedContacts)
        return parsedContacts
      }
    } catch (error) {
      console.error("Error loading contacts from storage:", error)
    }
    return []
  }, [currentUser.employeeId])

  const fetchAllSupervisors = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await instance.get("/user?size=100")

      if (response.data && Array.isArray(response.data.data.data)) {
        const supervisorData = response.data.data.data
          .filter((user: any) => user.mecCoordinator !== currentUser.mecCoordinator)
          .map((user: any) => ({
            id: user.id,
            employeeId: user.employeeId,
            mecCoordinator: user.mecCoordinator,
            name: user.name || `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
            status: user.isOnline ? "online" : "offline",
            lastMessage: "",
            lastMessageTime: "",
            unreadCount: 0,
          }))
        setAllSupervisors(supervisorData)
      }
    } catch (error) {
      console.error("Error fetching supervisors:", error)
      toast.error("Erro ao carregar supervisores")
    } finally {
      setIsLoading(false)
    }
  }, [currentUser.mecCoordinator])

  const addContact = useCallback(
    (supervisor: Supervisor) => {
      setContacts((prev) => {
        if (prev.find((c) => c.employeeId === supervisor.employeeId)) {
          toast.info("Supervisor já está nos seus contatos")
          return prev
        }
        const newContacts = [...prev, supervisor]
        saveContactsToStorage(newContacts)
        toast.success(`${supervisor.name} adicionado aos contatos`)
        return newContacts
      })
    },
    [saveContactsToStorage],
  )

  const removeContact = useCallback(
    (employeeId: string) => {
      setContacts((prev) => {
        const supervisor = prev.find((c) => c.employeeId === employeeId)
        const newContacts = prev.filter((c) => c.employeeId !== employeeId)
        saveContactsToStorage(newContacts)
        if (supervisor) {
          toast.success(`${supervisor.name} removido dos contatos`)
        }
        return newContacts
      })
    },
    [saveContactsToStorage],
  )

  const availableSupervisors = allSupervisors.filter(
    (supervisor) => !contacts.find((contact) => contact.employeeId === supervisor.employeeId),
  )

  const fetchMessages = useCallback(async (selectedSupervisorEmployeeId: string) => {
    try {
      setIsLoading(true)
      setMessages([])

      console.log("Fetching messages for:", {
        currentUserEmployeeId: currentUserRef.current,
        selectedSupervisorEmployeeId: selectedSupervisorEmployeeId,
      })

      const response = await instance.get(`/chat/${currentUserRef.current}/${selectedSupervisorEmployeeId}`)
      console.log("Messages response:", response.data)

      if (response.data && Array.isArray(response.data.data)) {
        const chatMessages = response.data.data.map((msg: any) => ({
          id: msg._id,
          senderId: msg.users.send,
          receiverId: msg.users.receive,
          content: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: msg.status || "sent",
          isUser: msg.users.send === currentUserRef.current,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileType: msg.fileType,
          fileSize: msg.fileSize,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        }))
        setMessages(chatMessages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
      toast.error("Erro ao carregar mensagens")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (content: string, receiverEmployeeId: string, file?: File) => {
    if (!content.trim() && !file) {
      toast.error("Mensagem não pode estar vazia")
      return
    }

    console.log("Sending message:", {
      from: currentUserRef.current,
      to: receiverEmployeeId,
      content: content,
      hasFile: !!file,
    })

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserRef.current,
      receiverId: receiverEmployeeId,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
      isUser: true,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
    }

    setMessages((prev) => [...prev, tempMessage])

    try {
      const formData = new FormData()
      if (content.trim()) {
        formData.append("content", content)
      }
      if (file) {
        formData.append("file", file)
      }

      const response = await instance.post(`/chat/send/${currentUserRef.current}/${receiverEmployeeId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? {
                  ...msg,
                  id: response.data.id,
                  status: "sent",
                  fileUrl: response.data.fileUrl,
                }
              : msg,
          ),
        )

        // Only send via socket if connected
        if (socketManager.isConnected()) {
          socketManager.sendMessage({
            messageId: response.data.id,
            senderId: currentUserRef.current,
            receiverId: receiverEmployeeId,
            content,
            timestamp: response.data.createdAt,
            fileUrl: response.data.fileUrl,
            fileName: file?.name,
            fileType: file?.type,
          })
        }

        toast.success("Mensagem enviada")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg)))
      toast.error("Erro ao enviar mensagem")
    }
  }, [])

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const message = messages.find((msg) => msg.id === messageId)
        if (!message) {
          toast.error("Mensagem não encontrada")
          return
        }

        const receiverId = message.isUser ? message.receiverId : message.senderId
        await instance.delete(`/chat/delete/${messageId}/${receiverId}`)
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
        toast.success("Mensagem deletada")
      } catch (error) {
        console.error("Error deleting message:", error)
        toast.error("Erro ao deletar mensagem")
      }
    },
    [messages],
  )

  const updateMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        const message = messages.find((msg) => msg.id === messageId)
        if (!message) {
          toast.error("Mensagem não encontrada")
          return
        }

        const receiverId = message.isUser ? message.receiverId : message.senderId
        const response = await instance.put(`/chat/update/${messageId}/${receiverId}`, {
          content: newContent,
        })

        if (response.data) {
          setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg)))
          toast.success("Mensagem atualizada")
        }
      } catch (error) {
        console.error("Error updating message:", error)
        toast.error("Erro ao atualizar mensagem")
      }
    },
    [messages],
  )

  // Socket connection with better error handling
  useEffect(() => {
    if (socketInitialized.current || !currentUser.employeeId) return

    console.log("Initializing socket connection for user:", currentUser.employeeId)

    try {
      const socket = socketManager.connect(currentUser.employeeId)
      socketInitialized.current = true

      const handleConnect = () => {
        console.log("Socket connected successfully")
        setIsConnected(true)
        toast.success("Conectado ao chat")
      }

      const handleDisconnect = () => {
        console.log("Socket disconnected")
        setIsConnected(false)
        toast.error("Desconectado do chat")
      }

      const handleConnectError = (error: any) => {
        console.error("Socket connection error:", error)
        setIsConnected(false)
        toast.error("Erro de conexão com o chat")
      }

      const handleMessageReceived = (message: any) => {
        const newMessage: Message = {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          timestamp: new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "delivered",
          isUser: message.senderId === currentUserRef.current,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileType: message.fileType,
        }
        setMessages((prev) => [...prev, newMessage])

        if (!newMessage.isUser) {
          toast.success(`Nova mensagem de ${message.senderName || "Supervisor"}`)
        }
      }

      const handleMessageStatusUpdate = (data: any) => {
        setMessages((prev) => prev.map((msg) => (msg.id === data.messageId ? { ...msg, status: data.status } : msg)))
      }

      const handleUserTyping = (data: any) => {
        if (data.userId !== currentUserRef.current) {
          setTypingUsers((prev) => new Set([...prev, data.userId]))
        }
      }

      const handleUserStoppedTyping = (data: any) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }

      socket.on("connect", handleConnect)
      socket.on("disconnect", handleDisconnect)
      socket.on("connect_error", handleConnectError)
      socketManager.onMessageReceived(handleMessageReceived)
      socketManager.onMessageStatusUpdate(handleMessageStatusUpdate)
      socketManager.onUserTyping(handleUserTyping)
      socketManager.onUserStoppedTyping(handleUserStoppedTyping)

      return () => {
        socket.off("connect", handleConnect)
        socket.off("disconnect", handleDisconnect)
        socket.off("connect_error", handleConnectError)
        socketManager.offMessageReceived(() => {})
        socketManager.offMessageStatusUpdate( () => {})
        socketManager.offUserTyping(() => {})
        socketManager.offUserStoppedTyping(() => {})
        socketManager.disconnect()
        socketInitialized.current = false
        setIsConnected(false)
      }
    } catch (error) {
      console.error("Failed to initialize socket:", error)
      toast.error("Erro ao conectar com o chat")
      setIsConnected(false)
    }
  }, [currentUser.employeeId])

  useEffect(() => {
    fetchAllSupervisors()
  }, [fetchAllSupervisors])

  useEffect(() => {
    loadContactsFromStorage()
  }, [loadContactsFromStorage])

  return {
    allSupervisors,
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
    fetchAllSupervisors,
    setMessages,
  }
}
