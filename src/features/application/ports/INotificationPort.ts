import { Notification } from "../domain/entities/Notification";

export interface INotificationPort {
  sendNotification(notification: Notification): Promise<void>;
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
} 