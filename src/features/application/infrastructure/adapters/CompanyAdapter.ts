import { ICompanyPort } from "../../ports/ICompanyPort";
import { Company } from "../../domain/entities/Company";
import instance from "@/lib/api";

export class CompanyAdapter implements ICompanyPort {
  async getCompanies(): Promise<Company[]> {
    const res = await instance.get(`/company?size=500`);
    return Array.isArray(res.data.data.data) ? res.data.data.data : [res.data.data.data];
  }

  async createCompany(data: Partial<Company>, clientId: string): Promise<Company> {
    const res = await instance.post(`/company/create/${clientId}`, data);
    return res.data.data;
  }

  async updateCompany(companyId: string,  data: Partial<Company>): Promise<Company> {
    const res = await instance.put(`/company/update/${companyId}`, data);
    return res.data.data;
  }

  async disableCompany(companyId: string, userId: string): Promise<void> {
    await instance.put(`/company/delete/${companyId}/${userId}`);
  }

  async addAdminToCompany(companyId: string, userId: string): Promise<void> {
    await instance.put(`/company/add/${companyId}/${userId}`);
  }
} 