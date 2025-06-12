import { Occurrence } from '../domain/entities/Occurrence';

export interface IOccurrencePort {
  // CRUD Operations
  getOccurrences(size?: number): Promise<Occurrence[]>;
  getOccurrenceById(id: string): Promise<Occurrence>;
  createOccurrence(occurrence: Omit<Occurrence, '_id'>): Promise<Occurrence>;
  updateOccurrence(id: string, occurrence: Partial<Occurrence>): Promise<Occurrence>;
  deleteOccurrence(id: string): Promise<void>;

  // Analytics Operations
  getOccurrenceAnalytics(timeFilter: string): Promise<Occurrence[]>;
  getOccurrenceCount(timeFilter: string): Promise<number>;
} 