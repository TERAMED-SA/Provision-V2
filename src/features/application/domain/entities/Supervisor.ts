export interface Supervisor {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  active?: boolean;
  employeeId?: string;
  address?: string;
  createdAt?: string;
  mecCoordinator?: string;
  lat?: number;
  lng?: number;
  time?: string;
  route?: Record<string, { lat: number; lng: number }>;
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