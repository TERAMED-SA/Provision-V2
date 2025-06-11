import { User, UserRepository } from '@/domain/entities/User';
import instance from '@/lib/api';

export class UserRepositoryImpl implements UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const response = await instance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const response = await instance.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const response = await instance.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await instance.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await instance.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
} 