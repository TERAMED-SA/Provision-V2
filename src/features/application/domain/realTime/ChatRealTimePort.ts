
export interface ChatRealTimePort {
  connect(userId: string): void;
  disconnect(): void;
  isConnected(): boolean;
  emit(event: string, payload: any): void;
  subscribe(event: string, handler: (data: any) => void): void;
  unsubscribe(event: string, handler: (data: any) => void): void;
} 