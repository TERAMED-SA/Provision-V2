"use client"
import { getUser } from "@/src/features/services/auth/authApi"
import ChatInterface from "@/src/ui/components/dashboard/chats/chat-interface"
import { Card } from "@/src/ui/components/ui/card"
import { useEffect, useState } from "react"

export default function Chat() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser()
        setUser(userData)
        console.log("User fetched:", userData)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Carregando...</p>
      </div>
    )
  }

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
        currentUser={{
          id: user.id,
          mecCoordinator: user.mecCoordinator,
          employeeId: user.employeeId,
          name: user.name || `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
        }}
      />
    </Card>
  )
}
