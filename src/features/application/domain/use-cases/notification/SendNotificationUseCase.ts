import { INotificationPort } from "../../../ports/INotificationPort";
import { Notification } from "../../entities/Notification";

export class SendNotificationUseCase {
  constructor(private notificationPort: INotificationPort) {}

  async execute(notification: Notification) {
    await this.notificationPort.sendNotification(notification);
  }
} 