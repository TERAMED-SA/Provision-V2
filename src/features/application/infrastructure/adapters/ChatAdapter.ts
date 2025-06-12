import { CurrentUser, Message, Supervisor } from '../../domain/entities/Chat';
import { IChatPort } from '../../ports/IChatPort';
import instance from '@/lib/api';

export class ChatAdapter implements IChatPort {
  private currentUser: CurrentUser | null = null;

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  async getSupervisors(): Promise<Supervisor[]> {
    const response = await instance.get<Supervisor[]>('/supervisors');
    return response.data;
  }

  async getMessages(supervisorId: string): Promise<Message[]> {
    const response = await instance.get<Message[]>(`/messages/${supervisorId}`);
    return response.data;
  }

  async sendMessage(supervisorId: string, content: string): Promise<Message> {
    const response = await instance.post<Message>('/messages', {
      supervisorId,
      content
    });
    return response.data;
  }

  async sendFile(supervisorId: string, file: File): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supervisorId', supervisorId);

    const response = await instance.post<Message>('/messages/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async markMessagesAsRead(supervisorId: string): Promise<void> {
    await instance.post(`/messages/${supervisorId}/read`);
  }

  async getUnreadCount(supervisorId: string): Promise<number> {
    const response = await instance.get<{ count: number }>(`/messages/${supervisorId}/unread`);
    return response.data.count;
  }
} 