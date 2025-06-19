import { IUserPort } from '../../../ports/IUserPort';
import { User } from '../../entities/User';

export class UpdateUserUseCase {
  constructor(private userPort: IUserPort) {}

  async execute(id: string, data: Partial<User>): Promise<User> {
    return this.userPort.updateUser(id, data);
  }
} 