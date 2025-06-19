import { Company } from "../domain/entities/Company";

export interface ICompanyPort {
  getCompanies(): Promise<Company[]>;
  createCompany(data: Partial<Company>, clientId: string): Promise<Company>;
  updateCompany(companyId: string, clientId: string, data: Partial<Company>): Promise<Company>;
  disableCompany(companyId: string, clientId: string): Promise<void>;
  addAdminToCompany(companyId: string, userId: string): Promise<void>;
} 