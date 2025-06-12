import { AuthFactory } from '../../features/application/infrastructure/factories/AuthFactory';
import { Auth } from '../../features/application/domain/entities/Auth';
import { AuthAdapter } from '../../features/application/infrastructure/adapters/AuthAdapter';

describe('Auth Integration Tests', () => {
  const authPort = AuthFactory.getAuthPort();
  let testUser: Auth;

  beforeAll(async () => {
    // Limpar qualquer estado de autenticação anterior
    authPort.clearAuth();
  });

  afterAll(async () => {
    // Limpar estado após os testes
    authPort.clearAuth();
  });

  describe('Login Flow', () => {
    it('deve realizar fluxo completo de autenticação', async () => {
      // Login
      const loginResponse = await authPort.login('testuser', 'password123');
      expect(loginResponse.token).toBeDefined();
      expect(loginResponse.data.data).toBeDefined();

      // Armazenar usuário para testes subsequentes
      testUser = loginResponse.data.data;

      // Verificar autenticação
      expect(authPort.isAuthenticated()).toBe(true);
      expect(authPort.getToken()).toBe(loginResponse.token);
      expect(authPort.getUser()).toEqual(testUser);
    });

    it('deve lidar com credenciais inválidas', async () => {
      await expect(authPort.login('invalid', 'invalid')).rejects.toThrow();
      expect(authPort.isAuthenticated()).toBe(false);
    });

    it('deve lidar com usuário não encontrado', async () => {
      await expect(authPort.login('nonexistent', 'password123')).rejects.toThrow();
      expect(authPort.isAuthenticated()).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('deve manter estado de autenticação entre operações', async () => {
      // Login
      const loginResponse = await authPort.login('testuser', 'password123');
      authPort.setAuth(loginResponse.token, loginResponse.data.data);

      // Verificar estado persistente
      expect(authPort.isAuthenticated()).toBe(true);
      expect(authPort.getUser()).toBeDefined();
      expect(authPort.getToken()).toBe(loginResponse.token);

      // Simular refresh de página
      const newInstance = AuthFactory.getAuthPort();
      expect(newInstance.isAuthenticated()).toBe(true);
      expect(newInstance.getUser()).toBeDefined();
    });

    it('deve limpar sessão corretamente', async () => {
      // Login
      const loginResponse = await authPort.login('testuser', 'password123');
      authPort.setAuth(loginResponse.token, loginResponse.data.data);

      // Logout
      authPort.clearAuth();
      expect(authPort.isAuthenticated()).toBe(false);
      expect(authPort.getUser()).toBeNull();
      expect(authPort.getToken()).toBeNull();

      // Verificar em nova instância
      const newInstance = AuthFactory.getAuthPort();
      expect(newInstance.isAuthenticated()).toBe(false);
    });
  });

  describe('User Data Operations', () => {
    it('deve atualizar dados do usuário após autenticação', async () => {
      // Login
      const loginResponse = await authPort.login('testuser', 'password123');
      authPort.setAuth(loginResponse.token, loginResponse.data.data);

      // Atualizar dados
      const updatedData = {
        name: 'Updated Name',
        phoneNumber: '987654321'
      };
      
      const updatedUser = await authPort.updateSupervisor(loginResponse.data.data._id, updatedData);
      expect(updatedUser.name).toBe(updatedData.name);
      expect(updatedUser.phoneNumber).toBe(updatedData.phoneNumber);
    });

    it('deve falhar ao atualizar dados sem autenticação', async () => {
      authPort.clearAuth();
      await expect(
        authPort.updateSupervisor('any-id', { name: 'New Name' })
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('deve lidar com erros de rede', async () => {
      // Simular erro de rede
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      await expect(authPort.login('testuser', 'password123')).rejects.toThrow('Network error');
    });

    it('deve lidar com respostas inválidas do servidor', async () => {
      // Simular resposta inválida
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      } as any);
      
      await expect(authPort.login('testuser', 'password123')).rejects.toThrow();
    });
  });
}); 