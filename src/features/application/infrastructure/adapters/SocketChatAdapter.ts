import { IChatPort } from "../../ports/IChatPort";
import { Message } from "../../domain/entities/Chat";
import { socketManager } from "@/lib/socket";

export class SocketChatAdapter implements IChatPort {
  async sendMessage(message: Message): Promise<void> {
    socketManager.sendMessage(message);
  }
  onMessageReceived(callback: (message: Message) => void): void {
    socketManager.onMessageReceived(callback);
  }
  joinRoom(roomId: string): void {
    socketManager.joinChatRoom(roomId);
  }
  leaveRoom(roomId: string): void {
    socketManager.leaveChatRoom(roomId);
  }
} 