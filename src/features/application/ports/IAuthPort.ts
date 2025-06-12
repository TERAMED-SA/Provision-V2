import { Auth, AuthResponse } from '../domain/entities/Auth';

export interface IAuthPort {
  login(number: string, password: string): Promise<AuthResponse>;
  setAuth(token: string, user: Auth): void;
  clearAuth(): void;
  getUser(): Auth | null;
  isAuthenticated(): boolean;
  getToken(): string | null;
  updateSupervisor(id: string, userData: Partial<Auth>): Promise<Auth>;
} 