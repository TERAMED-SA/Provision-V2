import { Supervisor, SupervisorLocation, SupervisorAnalytics } from '../../domain/entities/Supervisor';
import { ISupervisorPort } from '../../ports/ISupervisorPort';
import instance from '@/lib/api';

export class SupervisorAdapter implements ISupervisorPort {
  async getSupervisors(): Promise<Supervisor[]> {
    const response = await instance.get('/user?size=100');
    return response.data.data.data.map((user: any) => ({
      _id: user._id,
      name: user.name || "Sem nome",
      phoneNumber: user.phoneNumber || "Não informado",
      email: user.email,
      active: user.active !== false,
      avatar: user.avatar
    }));
  }

  async getSupervisorById(id: string): Promise<Supervisor> {
    const response = await instance.get(`/user/${id}`);
    return response.data.data;
  }

  async createSupervisor(supervisor: Omit<Supervisor, '_id'>): Promise<Supervisor> {
    const response = await instance.post('/user', supervisor);
    return response.data.data;
  }

  async updateSupervisor(id: string, supervisor: Partial<Supervisor>): Promise<Supervisor> {
    const response = await instance.put(`/user/updateMe/${id}`, supervisor);
    return response.data.data;
  }

  async deleteSupervisor(id: string): Promise<void> {
    await instance.delete(`/user/${id}`);
  }

  async getSupervisorLocations(): Promise<SupervisorLocation[]> {
    const response = await instance.get('/supervisor/locations');
    return response.data.data;
  }

  async updateSupervisorLocation(location: SupervisorLocation): Promise<void> {
    await instance.post('/supervisor/location', location);
  }

  async getSupervisorRoute(employeeId: string): Promise<Record<string, { lat: number; lng: number }>> {
    const response = await instance.get(`/supervisor/route/${employeeId}`);
    return response.data.data;
  }

  async getSupervisorAnalytics(timeFilter: string): Promise<SupervisorAnalytics[]> {
    const response = await instance.get(`/supervisor/analytics?timeFilter=${timeFilter}`);
    return response.data.data;
  }

  async getSupervisorActivityCount(timeFilter: string): Promise<number> {
    const response = await instance.get(`/supervisor/activity/count?timeFilter=${timeFilter}`);
    return response.data.data;
  }
} 