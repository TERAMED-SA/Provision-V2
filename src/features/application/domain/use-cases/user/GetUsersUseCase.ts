import { IUserPort } from '../../../ports/IUserPort';
import { User } from '../../entities/User';

export class GetUsersUseCase {
  constructor(private userPort: IUserPort) {}

  async execute(): Promise<User[]> {
    return this.userPort.getUsers();
  }
} 