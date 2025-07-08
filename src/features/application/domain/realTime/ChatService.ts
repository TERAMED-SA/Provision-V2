'use client';

import { ChatRealTimePort } from './ChatRealTimePort';

export class ChatService {
  constructor(private chatPort: ChatRealTimePort) {}

  connect(userId: string) {
    this.chatPort.connect(userId);
  }

  disconnect() {
    this.chatPort.disconnect();
  }

  sendMessage(payload: any) {
    this.chatPort.emit('send_message', payload);
  }

  onMessageReceived(handler: (data: any) => void) {
    this.chatPort.subscribe('message_received', handler);
  }

  offMessageReceived(handler: (data: any) => void) {
    this.chatPort.unsubscribe('message_received', handler);
  }

  // Outros métodos: typing, presence, etc.
} 