"use client"

import ChatInterface from "@/components/dashboard/chats/chat-interface"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth";

export default function Chat() {
 const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Acesso Negado</p>
          <p className="text-gray-600">Você precisa estar logado para acessar o chat</p>
        </div>
      </div>
    )
  }

 
  return (
    <Card className="bg-white dark:bg-gray-800 h-screen">
      <ChatInterface
      currentUser={user}
      className="h-full"
      />
    </Card>
  )
}