import { IOccurrencePort } from '../../ports/IOccurrencePort';
import { OccurrenceAdapter } from '../adapters/OccurrenceAdapter';
import { GetOccurrencesUseCase } from '../../domain/use-cases/occurrence/GetOccurrencesUseCase';
import { GetOccurrenceAnalyticsUseCase } from '../../domain/use-cases/occurrence/GetOccurrenceAnalyticsUseCase';

export class OccurrenceFactory {
  private static occurrencePort: IOccurrencePort;

  private static getOccurrencePort(): IOccurrencePort {
    if (!this.occurrencePort) {
      this.occurrencePort = new OccurrenceAdapter();
    }
    return this.occurrencePort;
  }

  static createGetOccurrencesUseCase(): GetOccurrencesUseCase {
    return new GetOccurrencesUseCase(this.getOccurrencePort());
  }

  static createGetOccurrenceAnalyticsUseCase(): GetOccurrenceAnalyticsUseCase {
    return new GetOccurrenceAnalyticsUseCase(this.getOccurrencePort());
  }
} 