import { User } from "../domain/entities/User";

export interface IUserPort {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getSupervisorsByCoordinator(mecId: string): Promise<User[]>;
  getSupervisorSites(userId: string): Promise<any[]>;
  getCompanySiteInfo(costCenter: string): Promise<any>;
} 