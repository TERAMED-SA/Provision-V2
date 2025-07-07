
import { IUserPort } from '../../ports/IUserPort';
import { User } from '../../domain/entities/User';
import instance from '@/lib/api';

export class UserAdapter implements IUserPort {
  async getUsers(): Promise<User[]> {
    try {
      const res = await instance.get(`/user?size=100`);
      return res.data.data.data || res.data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const res = await instance.get(`/user/${id}`);
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
      throw error;
    }
  }

  async getSupervisorSites(employeeId: string): Promise<any[]> {
    try {
      let res;
      try {
        res = await instance.get(`/companySite/getSupervisorSites/${employeeId}?size=500`);
      } catch (firstError) {
        res = await instance.get(`/companySite/getSuperivsorSites/${employeeId}?size=500`);
      }
      
  
      let sites = [];
      
      if (res.data.data && typeof res.data.data === 'object') {
        const possibleKeys = ['data', 'sites', 'results', 'items', 'companySites'];
        
        for (const key of possibleKeys) {
          if (Array.isArray(res.data.data[key])) {
            sites = res.data.data[key];
            break;
          }
        }
        
        if (sites.length === 0) {
          const allValues = Object.values(res.data.data);
          const arrays = allValues.filter(val => Array.isArray(val));
          if (arrays.length > 0) {
            sites = arrays[0] as any[];
          }
        }
      } else if (Array.isArray(res.data.data)) {
        sites = res.data.data;
      } else if (Array.isArray(res.data)) {
        sites = res.data;
        console.log('Found sites directly in data:', sites.length);
      }
 
      return Array.isArray(sites) ? sites : [];
    } catch (error) {
      const err = error as any;
      console.error('Error details:', err?.response?.data || err?.message);
      return [];
    }
  }

  async getCompanySiteInfo(costCenter: string): Promise<any> {
    try {
      const res = await instance.get(`/companySite/getCompanyInfo/${costCenter}`);
      return res.data.data?.data || res.data.data || res.data;
    } catch (error) {
      console.error('Error fetching company site info:', error);
      throw error;
    }
  }

  async assignSiteToSupervisor(employeeId: string, costCenter: string): Promise<any> {
    try {
      const response = await instance.put(`/companySite/assignSupervisor/${employeeId}/${costCenter}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao atribuir site ao supervisor:', error);
      throw error;
    }
  }
  async fetchUserRole(typeId: string): Promise<null> {
    try {
      const response = await instance.get(`/userAuth/checkType/${typeId}`)
      return response.data.data
    } catch (err: any) {
      return null
    } 
  }

}


