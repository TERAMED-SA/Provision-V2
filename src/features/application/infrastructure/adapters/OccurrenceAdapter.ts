import { IOccurrencePort } from '../../ports/IOccurrencePort';
import { Occurrence } from '../../domain/entities/Occurrence';
import instance from '@/lib/api';
import { format } from 'date-fns';

export class OccurrenceAdapter implements IOccurrencePort {
  async getOccurrences(size: number = 100): Promise<Occurrence[]> {
    const response = await instance.get(`/occurrence?size=${size}`);
    return response.data.data.data.map((occurrence: any) => ({
      ...occurrence,
      createdAt: format(new Date(occurrence.createdAt), "dd/MM/yyyy"),
      createdAtTime: format(new Date(occurrence.createdAt), "HH:mm"),
      createdAtDate: new Date(occurrence.createdAt),
      supervisorName: occurrence.supervisorName || "Carregando...",
      siteName: occurrence.name || "Carregando...",
    }));
  }

  async getOccurrenceById(id: string): Promise<Occurrence> {
    const response = await instance.get(`/occurrence/${id}`);
    const occurrence = response.data.data;
    return {
      ...occurrence,
      createdAt: format(new Date(occurrence.createdAt), "dd/MM/yyyy"),
      createdAtTime: format(new Date(occurrence.createdAt), "HH:mm"),
      createdAtDate: new Date(occurrence.createdAt),
      supervisorName: occurrence.supervisorName || "Carregando...",
      siteName: occurrence.name || "Carregando...",
    };
  }

  async createOccurrence(occurrence: Omit<Occurrence, '_id'>): Promise<Occurrence> {
    const response = await instance.post('/occurrence', occurrence);
    return response.data.data;
  }

  async updateOccurrence(id: string, occurrence: Partial<Occurrence>): Promise<Occurrence> {
    const response = await instance.put(`/occurrence/${id}`, occurrence);
    return response.data.data;
  }

  async deleteOccurrence(id: string): Promise<void> {
    await instance.delete(`/occurrence/${id}`);
  }

  async getOccurrenceAnalytics(timeFilter: string): Promise<Occurrence[]> {
    const response = await instance.get(`/occurrence/analytics?timeFilter=${timeFilter}`);
    return response.data.data;
  }

  async getOccurrenceCount(timeFilter: string): Promise<number> {
    const response = await instance.get(`/occurrence/count?timeFilter=${timeFilter}`);
    return response.data.data;
  }
} 