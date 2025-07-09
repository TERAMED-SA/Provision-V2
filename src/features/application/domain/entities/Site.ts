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