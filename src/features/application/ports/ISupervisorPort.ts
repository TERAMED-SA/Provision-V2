import { Supervisor, SupervisorLocation, SupervisorAnalytics } from '../domain/entities/Supervisor';

export interface ISupervisorPort {
  // CRUD Operations
  getSupervisors(): Promise<Supervisor[]>;
  getSupervisorById(id: string): Promise<Supervisor>;
  createSupervisor(supervisor: Omit<Supervisor, '_id'>): Promise<Supervisor>;
  updateSupervisor(id: string, supervisor: Partial<Supervisor>): Promise<Supervisor>;
  deleteSupervisor(id: string): Promise<void>;

  // Location Operations
  getSupervisorLocations(): Promise<SupervisorLocation[]>;
  updateSupervisorLocation(location: SupervisorLocation): Promise<void>;
  getSupervisorRoute(employeeId: string): Promise<Record<string, { lat: number; lng: number }>>;

  // Analytics Operations
  getSupervisorAnalytics(timeFilter: string): Promise<SupervisorAnalytics[]>;
  getSupervisorActivityCount(timeFilter: string): Promise<number>;
} 