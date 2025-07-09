import { ICompanyPort } from "../../ports/ICompanyPort";
import { Company } from "../../domain/entities/Company";
import instance from "@/lib/api";
import { Site } from "../../domain/entities/Site";
import { ISitePort } from "../../ports/ICompanyPort";

export class CompanyAdapter implements ICompanyPort {
  async getCompanies(): Promise<Company[]> {
    const res = await instance.get(`/company?size=500`);
    return Array.isArray(res.data.data.data) ? res.data.data.data : [res.data.data.data];
  }

  async createCompany(data: Partial<Company>): Promise<Company> {
    const res = await instance.post(`/company/create`, data);
    return res.data.data;
  }

  async updateCompany(companyId: string, data: Partial<Company>): Promise<Company> {
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

export class SiteAdapter implements ISitePort {
  async getSites(): Promise<Site[]> {
    const res = await instance.get(`/companySite?size=1000`);
    return Array.isArray(res.data.data.data) ? res.data.data.data : [res.data.data.data];
  }

  async createSite(data: Partial<Site>): Promise<Site> {
    const res = await instance.post(`/companySite/create`, data);
    return res.data.data;
  }

  async updateSite(siteId: string, data: Partial<Site>): Promise<Site> {
    const res = await instance.put(`/companySite/update/${siteId}`, data);
    return res.data.data;
  }

  async disableSite(siteId: string): Promise<void> {
    await instance.put(`/companySite/delete/${siteId}`);
  }

  async getCompanyInfo(costCenter: string): Promise<any> {
    const res = await instance.get(`/companySite/getCompanyInfo/${costCenter}`);
    return res.data.data;
  }

  async getSupervisionCount(supervisorCode: string): Promise<number> {
    const res = await instance.get(`/companySite/getSuperivsorSites/${supervisorCode}?size=500`);
    return res.data.data.data.length || 0;
  }
}

export const siteAdapter = new SiteAdapter(); 