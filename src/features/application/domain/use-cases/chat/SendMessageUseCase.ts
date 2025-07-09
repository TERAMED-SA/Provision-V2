import { IChatPort } from "../../../ports/IChatPort";
import { Message } from "../../entities/Chat";

export class SendMessageUseCase {
  constructor(private chatPort: IChatPort) {}

  async execute(message: Message) {
    await this.chatPort.sendMessage(message);
  }
} 