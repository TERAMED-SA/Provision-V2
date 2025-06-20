import { IUserPort } from '../../ports/IUserPort';
import { User } from '../../domain/entities/User';
import instance from '@/lib/api';

export class UserAdapter implements IUserPort {
  async getUsers(): Promise<User[]> {
    try {
      const res = await instance.get(`/user?size=100`);
      console.log('Users response:', res.data); // Debug log
      return res.data.data.data || res.data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const res = await instance.get(`/user/${id}`);
      console.log('User by ID response:', res.data); // Debug log
      return res.data.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const res = await instance.put(`/user/updateMe/${id}`, data);
      return res.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const res = await instance.put(`/user/deleteMe/${id}`);
      return res.data.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getSupervisorsByCoordinator(mecId: string): Promise<User[]> {
    try {
      const res = await instance.get(`/user/findBelongsToMe/${mecId}`);
      return res.data.data || [];
    } catch (error) {
      console.error('Error fetching supervisors by coordinator:', error);
      throw error;
    }
  }

  async getSupervisorSites(employeeId: string): Promise<any[]> {
    try {
      console.log('Fetching sites for employeeId:', employeeId); // Debug log
      let res;
      try {
        res = await instance.get(`/companySite/getSupervisorSites/${employeeId}?size=500`);
      } catch (firstError) {
        console.log('First endpoint failed, trying original:', (firstError as any).response?.status);
        res = await instance.get(`/companySite/getSuperivsorSites/${employeeId}?size=500`);
      }
      
  
      let sites = [];
      
      if (res.data.data && typeof res.data.data === 'object') {
        console.log('Data object keys:', Object.keys(res.data.data));
        
        // Verifica propriedades comuns para arrays de sites
        const possibleKeys = ['data', 'sites', 'results', 'items', 'companySites'];
        
        for (const key of possibleKeys) {
          if (Array.isArray(res.data.data[key])) {
            sites = res.data.data[key];
            console.log(`Found sites in data.data.${key}:`, sites.length);
            break;
          }
        }
        
        // Se não encontrou em propriedades específicas, procura qualquer array
        if (sites.length === 0) {
          const allValues = Object.values(res.data.data);
          const arrays = allValues.filter(val => Array.isArray(val));
          if (arrays.length > 0) {
            sites = arrays[0] as any[];
            console.log('Found array in data object:', sites.length);
          }
        }
      } else if (Array.isArray(res.data.data)) {
        sites = res.data.data;
        console.log('Found sites directly in data.data:', sites.length);
      } else if (Array.isArray(res.data)) {
        sites = res.data;
        console.log('Found sites directly in data:', sites.length);
      }
 
      return Array.isArray(sites) ? sites : [];
    } catch (error) {
      console.error('Error fetching supervisor sites:', error);
      const err = error as any;
      console.error('Error details:', err?.response?.data || err?.message);
      return [];
    }
  }

  async getCompanySiteInfo(costCenter: string): Promise<any> {
    try {
      console.log('Fetching company info for cost center:', costCenter); // Debug log
      const res = await instance.get(`/companySite/getCompanyInfo/${costCenter}`);
      console.log('Company info API response:', res.data); // Debug log
      
      return res.data.data?.data || res.data.data || res.data;
    } catch (error) {
      console.error('Error fetching company site info:', error);
      throw error;
    }
  }
}