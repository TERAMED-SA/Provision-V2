import { OccurrenceAdapter } from '../../features/application/infrastructure/adapters/OccurrenceAdapter';
import { GetOccurrencesUseCase } from '../../features/application/use-cases/occurrence/GetOccurrencesUseCase';
import { GetOccurrenceAnalyticsUseCase } from '../../features/application/use-cases/occurrence/GetOccurrenceAnalyticsUseCase';
import { Occurrence } from '../../features/application/domain/entities/Occurrence';
import instance from '@/lib/api';

jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('Occurrence Integration Tests', () => {
  let occurrenceAdapter: OccurrenceAdapter;
  let getOccurrencesUseCase: GetOccurrencesUseCase;
  let getOccurrenceAnalyticsUseCase: GetOccurrenceAnalyticsUseCase;

  beforeEach(() => {
    occurrenceAdapter = new OccurrenceAdapter();
    getOccurrencesUseCase = new GetOccurrencesUseCase(occurrenceAdapter);
    getOccurrenceAnalyticsUseCase = new GetOccurrenceAnalyticsUseCase(occurrenceAdapter);
  });

  describe('Fluxo de Ocorrências', () => {
    it('deve buscar ocorrências com sucesso', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{
              _id: '1',
              createdAt: '2024-01-01T10:00:00Z',
              name: 'Site 1',
              costCenter: 'CC1',
              supervisorName: 'Supervisor 1',
              priority: 'BAIXA',
              details: 'Detalhes 1'
            }]
          }
        }
      };

      (instance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getOccurrencesUseCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('createdAtTime');
      expect(result[0]).toHaveProperty('createdAtDate');
      expect(instance.get).toHaveBeenCalledWith('/occurrence?size=100');
    });

    it('deve lidar com erro de timeout na busca de ocorrências', async () => {
      (instance.get as jest.Mock).mockRejectedValueOnce({ name: 'AbortError' });

      await expect(getOccurrencesUseCase.execute()).rejects.toThrow('Erro ao carregar ocorrências');
    });

    it('deve lidar com resposta inválida da API', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({ data: { data: {} } });

      await expect(getOccurrencesUseCase.execute()).rejects.toThrow('Erro ao carregar ocorrências');
    });
  });

  describe('Fluxo de Analytics', () => {
    it('deve buscar analytics com sucesso', async () => {
      const mockResponse = {
        data: {
          data: [{
            _id: '1',
            createdAt: '2024-01-01T10:00:00Z',
            name: 'Site 1',
            costCenter: 'CC1',
            supervisorName: 'Supervisor 1',
            priority: 'BAIXA',
            details: 'Detalhes 1'
          }]
        }
      };

      (instance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getOccurrenceAnalyticsUseCase.execute('day');

      expect(result).toHaveLength(1);
      expect(instance.get).toHaveBeenCalledWith('/occurrence/analytics?timeFilter=day');
    });

    it('deve lidar com erro de timeout na busca de analytics', async () => {
      (instance.get as jest.Mock).mockRejectedValueOnce({ name: 'AbortError' });

      await expect(getOccurrenceAnalyticsUseCase.execute('day')).rejects.toThrow('Erro ao carregar analytics de ocorrências');
    });

    it('deve lidar com resposta inválida da API de analytics', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({ data: {} });

      await expect(getOccurrenceAnalyticsUseCase.execute('day')).rejects.toThrow('Erro ao carregar analytics de ocorrências');
    });
  });
}); 