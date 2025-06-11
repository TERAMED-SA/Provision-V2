import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore, { loginRequest } from '@/features/auth/authApi';


export const useAuth = () => {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
    getUser,
    initializeAuth
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (number: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginRequest(number, password);
    
      const userData = response.data.data;
      const token = response.token;
      const { password: _, ...userWithoutPassword } = userData;
      
      setAuth(token, userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao fazer login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getUser
  };
};