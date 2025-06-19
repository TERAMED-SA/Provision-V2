import { IUserPort } from '../../../ports/IUserPort';
import { User } from '../../entities/User';

export class GetSupervisorsByCoordinatorUseCase {
  constructor(private userPort: IUserPort) {}

  async execute(mecId: string): Promise<User[]> {
    return this.userPort.getSupervisorsByCoordinator(mecId);
  }
} 