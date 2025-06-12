import { AuthFactory } from '../../features/application/infrastructure/factories/AuthFactory';
import { Auth } from '../../features/application/domain/entities/Auth';
import { AuthAdapter } from '../../features/application/infrastructure/adapters/AuthAdapter';

describe('Auth Unit Tests', () => {
  const authPort = AuthFactory.getAuthPort();
  const mockUser: Auth = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    address: 'Test Address',
    phoneNumber: '123456789',
    employeeId: 'EMP001',
    type: 'user',
    mecCoordinator: 'coord1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  };

  beforeEach(() => {
    authPort.clearAuth();
  });

  describe('Authentication State Management', () => {
    it('deve definir autenticação com token e usuário', () => {
      authPort.setAuth('test-token', mockUser);
      expect(authPort.isAuthenticated()).toBe(true);
      expect(authPort.getUser()).toEqual(mockUser);
      expect(authPort.getToken()).toBe('test-token');
    });

    it('deve limpar autenticação', () => {
      authPort.setAuth('test-token', mockUser);
      authPort.clearAuth();
      expect(authPort.isAuthenticated()).toBe(false);
      expect(authPort.getUser()).toBeNull();
      expect(authPort.getToken()).toBeNull();
    });

    it('deve retornar usuário nulo quando não autenticado', () => {
      expect(authPort.getUser()).toBeNull();
    });
  });

  describe('Login Validation', () => {
    it('deve validar formato do número de telefone', () => {
      const invalidNumbers = ['123', '1234567890', 'abc123456'];
      invalidNumbers.forEach(number => {
        expect(() => authPort.login(number, 'password123')).rejects.toThrow();
      });
    });

    it('deve validar formato da senha', () => {
      const invalidPasswords = ['', '12345', '12345678901234567890'];
      invalidPasswords.forEach(password => {
        expect(() => authPort.login('123456789', password)).rejects.toThrow();
      });
    });
  });

  describe('User Data Management', () => {
    it('deve atualizar dados do usuário corretamente', async () => {
      authPort.setAuth('test-token', mockUser);
      const updatedData = {
        name: 'Updated Name',
        phoneNumber: '987654321'
      };
      
      const updatedUser = await authPort.updateSupervisor(mockUser._id, updatedData);
      expect(updatedUser.name).toBe(updatedData.name);
      expect(updatedUser.phoneNumber).toBe(updatedData.phoneNumber);
    });

    it('deve manter dados não atualizados inalterados', async () => {
      authPort.setAuth('test-token', mockUser);
      const updatedData = {
        name: 'Updated Name'
      };
      
      const updatedUser = await authPort.updateSupervisor(mockUser._id, updatedData);
      expect(updatedUser.email).toBe(mockUser.email);
      expect(updatedUser.address).toBe(mockUser.address);
    });
  });

  describe('Token Management', () => {
    it('deve persistir token entre instâncias', () => {
      authPort.setAuth('test-token', mockUser);
      const newInstance = AuthFactory.getAuthPort();
      expect(newInstance.getToken()).toBe('test-token');
    });

    it('deve limpar token em todas as instâncias', () => {
      authPort.setAuth('test-token', mockUser);
      const newInstance = AuthFactory.getAuthPort();
      authPort.clearAuth();
      expect(newInstance.getToken()).toBeNull();
    });
  });
}); 