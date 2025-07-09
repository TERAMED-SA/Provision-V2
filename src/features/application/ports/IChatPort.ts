import { Message } from "../domain/entities/Chat";

export interface IChatPort {
  sendMessage(message: Message): Promise<void>;
  onMessageReceived(callback: (message: Message) => void): void;
  joinRoom(roomId: string): void;
  leaveRoom(roomId: string): void;
} 