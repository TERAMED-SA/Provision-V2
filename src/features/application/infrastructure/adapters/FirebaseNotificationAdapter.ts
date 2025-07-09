import { INotificationPort } from "../../ports/INotificationPort";
import { Notification } from "../../domain/entities/Notification";
// Importe o firebase/app e firebase/messaging conforme necessário

export class FirebaseNotificationAdapter implements INotificationPort {
  async sendNotification(notification: Notification): Promise<void> {
    // Lógica para enviar notificação via Firebase
    // Exemplo: usar fetch para chamar endpoint de cloud function ou FCM
  }
  async getNotifications(userId: string): Promise<Notification[]> {
    // Lógica para buscar notificações do usuário
    return [];
  }
  async markAsRead(notificationId: string): Promise<void> {
    // Lógica para marcar como lida
  }
} 