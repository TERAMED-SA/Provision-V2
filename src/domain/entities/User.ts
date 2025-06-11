export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: 'M' | 'F';
  employeeId: string;
  roler: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
} 