import { IUserPort } from '../../../ports/IUserPort';

export class DeleteUserUseCase {
  constructor(private userPort: IUserPort) {}

  async execute(id: string): Promise<void> {
    return this.userPort.deleteUser(id);
  }
} 