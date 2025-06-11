import { GetUserUseCase } from '@/application/use-cases/user/GetUserUseCase';
import { User, UserRepository } from '@/domain/entities/User';

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    getUserUseCase = new GetUserUseCase(mockUserRepository);
  });

  it('should return a user when found', async () => {
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '123456789',
      address: '123 Main St',
      gender: 'M',
      employeeId: 'EMP001',
      roler: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);

    const result = await getUserUseCase.execute('1');

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should return null when user is not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const result = await getUserUseCase.execute('999');

    expect(result).toBeNull();
    expect(mockUserRepository.findById).toHaveBeenCalledWith('999');
  });

  it('should handle repository errors', async () => {
    mockUserRepository.findById.mockRejectedValue(new Error('Repository error'));

    await expect(getUserUseCase.execute('1')).rejects.toThrow('Repository error');
    expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
  });
}); 