import { User, UserRepository } from '@/domain/entities/User';

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}

export class GetAllUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.userRepository.create(userData);
  }
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, userData: Partial<User>): Promise<User> {
    return this.userRepository.update(id, userData);
  }
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
} 