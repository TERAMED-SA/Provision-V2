import { IUserPort } from '../../ports/IUserPort';
import { User } from '../../domain/entities/User';
import instance from '@/lib/api';

export class UserAdapter implements IUserPort {
  async getUsers(): Promise<User[]> {
    const res = await instance.get(`/user?size=100`);
    return res.data.data.data;
  }

  async getUserById(id: string): Promise<User> {
    const res = await instance.get(`user/${id}`);
    return res.data.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await instance.put(`user/updateMe/${id}`, data);
    return res.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    const res = await instance.put(`user/deleteMe/${id}`);
    return res.data.data;
  }

  async getSupervisorsByCoordinator(mecId: string): Promise<User[]> {
    const res = await instance.get(`user/findBelongsToMe/${mecId}`);
    return res.data.data;
  }
} 