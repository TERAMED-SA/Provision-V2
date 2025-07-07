import { useEffect, useState } from 'react';
import { AuthFactory } from '@/features/application/infrastructure/factories/AuthFactory';
import { Auth } from '@/features/application/domain/entities/Auth';

export function useAuth() {
  const authPort = AuthFactory.getAuthPort();
  const [user, setUser] = useState<Auth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const currentUser = authPort.getUser();
        setUser(currentUser);
      } catch (err) {
        setError('Erro ao inicializar autenticação');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (number: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authPort.login(number, password);
      authPort.setAuth(response.token, response.data.data);
      setUser(response.data.data);
      return response;
    } catch (err) {
      setError('Credenciais inválidas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authPort.clearAuth();
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      setError('Erro ao fazer logout');
    }
  };

  const updateUser = async (userData: Partial<Auth>) => {
    try {
      if (!user?._id) throw new Error('Usuário não autenticado');
      const updatedUser = await authPort.updateSupervisor(user._id, userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError('Erro ao atualizar usuário');
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: authPort.isAuthenticated()
  };
}