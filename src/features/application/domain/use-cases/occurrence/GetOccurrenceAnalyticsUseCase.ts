import { IOccurrencePort } from "@/features/application/ports/IOccurrencePort"
import { OccurrenceAnalytics } from "../../entities/OccurrenceAnalytics"

export class GetOccurrenceAnalyticsUseCase {
  constructor(private readonly occurrencePort: IOccurrencePort) {}

  async execute(): Promise<OccurrenceAnalytics> {
    return this.occurrencePort.getOccurrenceAnalytics()
  }
} 