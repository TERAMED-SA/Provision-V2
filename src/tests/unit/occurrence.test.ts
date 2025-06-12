import { OccurrenceAdapter } from '../../features/application/infrastructure/adapters/OccurrenceAdapter';
import { GetOccurrencesUseCase } from '../../features/application/use-cases/occurrence/GetOccurrencesUseCase';
import { GetOccurrenceAnalyticsUseCase } from '../../features/application/use-cases/occurrence/GetOccurrenceAnalyticsUseCase';
import { Occurrence } from '../../features/application/domain/entities/Occurrence';

jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('Occurrence Use Cases', () => {
  let occurrenceAdapter: OccurrenceAdapter;
  let getOccurrencesUseCase: GetOccurrencesUseCase;
  let getOccurrenceAnalyticsUseCase: GetOccurrenceAnalyticsUseCase;

  beforeEach(() => {
    occurrenceAdapter = new OccurrenceAdapter();
    getOccurrencesUseCase = new GetOccurrencesUseCase(occurrenceAdapter);
    getOccurrenceAnalyticsUseCase = new GetOccurrenceAnalyticsUseCase(occurrenceAdapter);
  });

  describe('GetOccurrencesUseCase', () => {
    it('deve retornar lista de ocorrências com sucesso', async () => {
      const mockOccurrences: Occurrence[] = [
        {
          _id: '1',
          createdAt: '01/01/2024',
          createdAtTime: '10:00',
          createdAtDate: new Date(),
          siteName: 'Site 1',
          costCenter: 'CC1',
          supervisorName: 'Supervisor 1',
          priority: 'BAIXA',
          details: 'Detalhes 1'
        }
      ];

      jest.spyOn(occurrenceAdapter, 'getOccurrences').mockResolvedValue(mockOccurrences);

      const result = await getOccurrencesUseCase.execute();

      expect(result).toEqual(mockOccurrences);
      expect(occurrenceAdapter.getOccurrences).toHaveBeenCalled();
    });

    it('deve lançar erro ao falhar ao buscar ocorrências', async () => {
      jest.spyOn(occurrenceAdapter, 'getOccurrences').mockRejectedValue(new Error('API Error'));

      await expect(getOccurrencesUseCase.execute()).rejects.toThrow('Erro ao carregar ocorrências');
    });
  });

  describe('GetOccurrenceAnalyticsUseCase', () => {
    it('deve retornar analytics de ocorrências com sucesso', async () => {
      const mockAnalytics: Occurrence[] = [
        {
          _id: '1',
          createdAt: '01/01/2024',
          createdAtTime: '10:00',
          createdAtDate: new Date(),
          siteName: 'Site 1',
          costCenter: 'CC1',
          supervisorName: 'Supervisor 1',
          priority: 'BAIXA',
          details: 'Detalhes 1'
        }
      ];

      jest.spyOn(occurrenceAdapter, 'getOccurrenceAnalytics').mockResolvedValue(mockAnalytics);

      const result = await getOccurrenceAnalyticsUseCase.execute('day');

      expect(result).toEqual(mockAnalytics);
      expect(occurrenceAdapter.getOccurrenceAnalytics).toHaveBeenCalledWith('day');
    });

    it('deve lançar erro ao falhar ao buscar analytics', async () => {
      jest.spyOn(occurrenceAdapter, 'getOccurrenceAnalytics').mockRejectedValue(new Error('API Error'));

      await expect(getOccurrenceAnalyticsUseCase.execute('day')).rejects.toThrow('Erro ao carregar analytics de ocorrências');
    });
  });
}); 