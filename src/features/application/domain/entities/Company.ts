export interface Company {
  _id?: string;
  id: string;
  name: string;
  logo?: string;
  clientCode: string;
  costCenter: string,
  zone: string,
  sites: number;
  occurrences: number;
  numberOfWorkers: string;
}

export interface Site {
  _id: string;
  name: string;
  address?: string;
  ctClient?: string;
  clientCode: string;
  costCenter: string;
  numberOfWorkers: number;
  supervisorCode: string;
  zone: string;
} 