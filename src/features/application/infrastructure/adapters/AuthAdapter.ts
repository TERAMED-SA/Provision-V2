import { Auth, AuthResponse } from '../../domain/entities/Auth';
import { IAuthPort } from '../../ports/IAuthPort';
import instance from '@/lib/api';
import Cookies from 'js-cookie';

export class AuthAdapter implements IAuthPort {
  private static instance: AuthAdapter;
  private user: Auth | null = null;
  private token: string | null = null;

  private constructor() {
    const token = Cookies.get('auth_token');
    if (token) {
      this.token = token;
    }
  }

  public static getInstance(): AuthAdapter {
    if (!AuthAdapter.instance) {
      AuthAdapter.instance = new AuthAdapter();
    }
    return AuthAdapter.instance;
  }

  async login(number: string, password: string): Promise<AuthResponse> {
    const response = await instance.post<AuthResponse>("/userAuth/signIn", { number, password });
    return response.data;
  }

  setAuth(token: string, user: Auth): void {
    Cookies.set('auth_token', token);
    this.token = token;
    this.user = user;
  }

  clearAuth(): void {
    Cookies.remove('auth_token');
    this.token = null;
    this.user = null;
  }

  getUser(): Auth | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  async updateSupervisor(id: string, userData: Partial<Auth>): Promise<Auth> {
    const response = await instance.put(`/user/updateMe/${id}`, userData);
    if (this.user?._id === id) {
      this.user = { ...this.user, ...userData };
    }
    return response.data.data;
  }
} 