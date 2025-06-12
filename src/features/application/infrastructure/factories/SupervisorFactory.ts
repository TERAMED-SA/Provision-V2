import { ISupervisorPort } from '../../ports/ISupervisorPort';
import { SupervisorAdapter } from '../adapters/SupervisorAdapter';

export class SupervisorFactory {
  private static instance: ISupervisorPort;

  static getSupervisorPort(): ISupervisorPort {
    if (!SupervisorFactory.instance) {
      SupervisorFactory.instance = new SupervisorAdapter();
    }
    return SupervisorFactory.instance;
  }
} 