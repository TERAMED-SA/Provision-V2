"use client"

import { useEffect, useState } from "react"
import { ChatFactory } from "@/features/application/infrastructure/factories/ChatFactory"
import { Message, Supervisor } from "@/features/application/domain/entities/Chat"
import { useTranslations } from "next-intl"

export default function ChatPage() {
  const t = useTranslations("chat")
  const chatPort = ChatFactory.getChatPort()
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSupervisors()
  }, [])

  const loadSupervisors = async () => {
    try {
      const supervisorsList = await chatPort.getSupervisors()
      setSupervisors(supervisorsList)
    } catch (error) {
      console.error("Erro ao carregar supervisores:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSupervisorSelect = async (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor)
    try {
      const supervisorMessages = await chatPort.getMessages(supervisor.id)
      setMessages(supervisorMessages)
      await chatPort.markMessagesAsRead(supervisor.id)
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedSupervisor) return

    try {
      const message = await chatPort.sendMessage(selectedSupervisor.id, content)
      setMessages(prev => [...prev, message])
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    }
  }

  const handleSendFile = async (file: File) => {
    if (!selectedSupervisor) return

    try {
      const message = await chatPort.sendFile(selectedSupervisor.id, file)
      setMessages(prev => [...prev, message])
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-full">
      {/* Lista de supervisores */}
      <div className="w-1/4 border-r p-4">
        <h2 className="text-lg font-semibold mb-4">{t("supervisors")}</h2>
        <div className="space-y-2">
          {supervisors.map(supervisor => (
            <div
              key={supervisor.id}
              className={`p-3 rounded cursor-pointer ${
                selectedSupervisor?.id === supervisor.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleSupervisorSelect(supervisor)}
            >
              <div className="font-medium">{supervisor.name}</div>
              <div className="text-sm opacity-70">{supervisor.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedSupervisor ? (
          <>
            {/* Cabeçalho do chat */}
            <div className="p-4 border-b">
              <h3 className="font-semibold">{selectedSupervisor.name}</h3>
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.isUser ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t">
              <input
                type="text"
                placeholder={t("typeMessage")}
                className="w-full p-2 border rounded"
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    handleSendMessage(e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {t("selectSupervisor")}
          </div>
        )}
      </div>
    </div>
  )
}
