export interface Supervisor {
  deletedAt: string | null;
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
  email: string;
  employeeId: string;
  address: string;
  supervisorCode: string;
  taskId: string | null;
  time: string;
  costCenter: string;
  equipment: {
    name: string;
    serialNumber: string;
    state: string;
    costCenter: string;
    obs: string;
  }[];
  validation: boolean;
  idNotification: string;
  report: string;
  workersFound: number;
}

export interface SupervisorLocation {
  employeeId: string;
  userId: string;
  name: string;
  lat?: number;
  lng?: number;
  time?: string;
  route?: Record<string, { lat: number; lng: number }>;
}

export interface SupervisorAnalytics {
  supervisorName?: string;
  createdAt: string;
  createdAtDate: Date;
} 