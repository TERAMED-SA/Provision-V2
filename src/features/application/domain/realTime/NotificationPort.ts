export interface NotificationPort {
  initialize(): Promise<void>;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
  onMessage(callback: (payload: any) => void): void;
} 