import { CurrentUser, Message, Supervisor } from '../domain/entities/Chat';

export interface IChatPort {
  getCurrentUser(): CurrentUser | null;
  getSupervisors(): Promise<Supervisor[]>;
  getMessages(supervisorId: string): Promise<Message[]>;
  sendMessage(supervisorId: string, content: string): Promise<Message>;
  sendFile(supervisorId: string, file: File): Promise<Message>;
  markMessagesAsRead(supervisorId: string): Promise<void>;
  getUnreadCount(supervisorId: string): Promise<number>;
} 