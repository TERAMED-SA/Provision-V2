import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AuthResponse, User } from '@/types/auth';
import instance from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getUser: () => User | null;
  initializeAuth: () => void;
}

const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (token: string, user: User) => {
        Cookies.set('auth_token', token);
        
        set({
          token,
          user,
          isAuthenticated: true,
          error: null
        });
      },

      clearAuth: () => {
        Cookies.remove('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      getUser: () => get().user,

      initializeAuth: () => {
        const token = Cookies.get('auth_token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      }
    }),
    {
      name: 'auth-store'
    }
  )
);

export default useAuthStore;export const loginRequest = async (number: string, password: string) => {
  const response = await instance.post<AuthResponse>("/userAuth/signIn", { number, password });
  return response.data; 
};
