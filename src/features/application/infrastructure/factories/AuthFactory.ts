import { IAuthPort } from '../../ports/IAuthPort';
import { AuthAdapter } from '../adapters/AuthAdapter';

export class AuthFactory {
  private static instance: IAuthPort;

  static getAuthPort(): IAuthPort {
    if (!AuthFactory.instance) {
      AuthFactory.instance = AuthAdapter.getInstance();
    }
    return AuthFactory.instance;
  }
} 