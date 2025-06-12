import { IChatPort } from '../../ports/IChatPort';
import { ChatAdapter } from '../adapters/ChatAdapter';

export class ChatFactory {
  private static instance: IChatPort;

  static getChatPort(): IChatPort {
    if (!ChatFactory.instance) {
      ChatFactory.instance = new ChatAdapter();
    }
    return ChatFactory.instance;
  }
} 