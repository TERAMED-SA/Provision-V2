import { IAuthRepository } from '../../ports/auth/IAuthRepository';
import { User } from '../../domain/entities/User';
import Cookies from 'js-cookie';
import instance from '@/lib/api';

export class AuthRepositoryAdapter implements IAuthRepository {
  async login(phoneNumber: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const response = await instance.post('/userAuth/signIn', { number: phoneNumber, password });
      const { token, data } = response.data;
      
      const user = User.create(
        data.data._id,
        data.data.name,
        data.data.email,
        data.data.address,
        data.data.phoneNumber,
        data.data.employeeId,
        data.data.type,
        data.data.mecCoordinator,
        new Date(data.data.createdAt),
        new Date(data.data.updatedAt),
        data.data.deletedAt ? new Date(data.data.deletedAt) : null
      );

      Cookies.set('auth_token', token);
      return { token, user };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await instance.post('/userAuth/signOut');
      Cookies.remove('auth_token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the token even if the API call fails
      Cookies.remove('auth_token');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = Cookies.get('auth_token');
      if (!token) return null;

      const response = await instance.get('/userAuth/me');
      const userData = response.data.data;

      return User.create(
        userData._id,
        userData.name,
        userData.email,
        userData.address,
        userData.phoneNumber,
        userData.employeeId,
        userData.type,
        userData.mecCoordinator,
        new Date(userData.createdAt),
        new Date(userData.updatedAt),
        userData.deletedAt ? new Date(userData.deletedAt) : null
      );
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  }
} 