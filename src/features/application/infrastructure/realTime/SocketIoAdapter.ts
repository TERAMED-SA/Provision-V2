'use client'

import { ChatRealTimePort } from '@/features/application/domain/realTime/ChatRealTimePort';
import { socketManager } from '@/lib/socket';

export class SocketIoAdapter implements ChatRealTimePort {
  connect(userId: string): void {
    socketManager.connect(userId);
  }
  disconnect(): void {
    socketManager.disconnect();
  }
  isConnected(): boolean {
    return socketManager.isConnected();
  }
  emit(event: string, payload: any): void {
    socketManager.getSocket()?.emit(event, payload);
  }
  subscribe(event: string, handler: (data: any) => void): void {
    socketManager.getSocket()?.on(event, handler);
  }
  unsubscribe(event: string, handler: (data: any) => void): void {
    socketManager.getSocket()?.off(event, handler);
  }
} 