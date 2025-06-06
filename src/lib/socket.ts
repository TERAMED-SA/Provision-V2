import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private url: string

  constructor() {
    this.url = process.env.NEXT_PUBLIC_POCKET_URL || "http://localhost:3001"
  }

  isConnected(): boolean {  
    return this.socket?.connected || false
  }

  connect(userId: string): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(this.url, {
      query: { userId },
      transports: ["websocket"],
      autoConnect: true,
    })

    this.socket.on("connect", () => {
      console.log("Connected to socket server")
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  onMessageReceived(callback: (message: any) => void) {
    this.socket?.on("message_received", callback)
  }

  offMessageReceived(callback: (message: any) => void) {
    this.socket?.off("message_received", callback)
  }

  onMessageStatusUpdate(callback: (data: any) => void) {
    this.socket?.on("message_status_update", callback)
  }

  offMessageStatusUpdate(callback: (data: any) => void) {
    this.socket?.off("message_status_update", callback)
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on("user_typing", callback)
  }

  offUserTyping(callback: (data: any) => void) {
    this.socket?.off("user_typing", callback)
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    this.socket?.on("user_stopped_typing", callback)
  }

  offUserStoppedTyping(callback: (data: any) => void) {
    this.socket?.off("user_stopped_typing", callback)
  }

  sendMessage(data: any) {
    this.socket?.emit("send_message", data)
  }

  joinChatRoom(roomId: string) {
    this.socket?.emit("join_chat", { roomId })
  }

  leaveChatRoom(roomId: string) {
    this.socket?.emit("leave_chat", { roomId })
  }

  emitTyping(roomId: string, userId: string) {
    this.socket?.emit("typing", { roomId, userId })
  }

  emitStoppedTyping(roomId: string, userId: string) {
    this.socket?.emit("stopped_typing", { roomId, userId })
  }
}

export const socketManager = new SocketManager()
