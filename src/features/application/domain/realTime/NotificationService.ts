// Serviço de domínio para notificações push, desacoplado do provedor.
// Depende apenas da porta NotificationPort.

'use client';

import { NotificationPort } from './NotificationPort';

export class NotificationService {
  constructor(private notificationPort: NotificationPort) {}

  async initialize() {
    await this.notificationPort.initialize();
  }

  onMessage(handler: (payload: any) => void) {
    this.notificationPort.onMessage(handler);
  }

  // Métodos para subscribe/unsubscribe em tópicos, se backend suportar
} 