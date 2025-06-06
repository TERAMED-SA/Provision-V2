export interface CurrentUser {
  id: string
  employeeId: string
  mecCoordinator: string
  name: string
  email: string
  avatar?: string
}

export interface Supervisor {
  id: string
  employeeId: string
  mecCoordinator: string
  name: string
  email: string
  avatar?: string
  status: "online" | "offline" | "away" | "busy"
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  isUser: boolean
  isEmpty?: boolean
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  createdAt?: string
  updatedAt?: string
}
