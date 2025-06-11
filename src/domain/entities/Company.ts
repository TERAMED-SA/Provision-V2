export interface Company {
  id: string;
  name: string;
  clientCode: string;
  address: string;
  costCenter: string;
  numberOfWorkers: number;
  supervisorCode: string;
  zone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyRepository {
  findById(id: string): Promise<Company | null>;
  findAll(): Promise<Company[]>;
  create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company>;
  update(id: string, company: Partial<Company>): Promise<Company>;
  delete(id: string): Promise<void>;
} 