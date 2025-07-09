import { Company } from "../domain/entities/Company";
import { Site } from "../domain/entities/Site";

export interface ICompanyPort {
  getCompanies(): Promise<Company[]>;
  createCompany(data: Partial<Company>, clientId: string): Promise<Company>;
  updateCompany(companyId: string,  data: Partial<Company>): Promise<Company>;
  disableCompany(companyId: string, clientId: string): Promise<void>;
  addAdminToCompany(companyId: string, userId: string): Promise<void>;
}

export interface ISitePort {
  getSites(): Promise<Site[]>;
  createSite(data: Partial<Site>): Promise<Site>;
  updateSite(siteId: string, data: Partial<Site>): Promise<Site>;
  disableSite(siteId: string): Promise<void>;
} 