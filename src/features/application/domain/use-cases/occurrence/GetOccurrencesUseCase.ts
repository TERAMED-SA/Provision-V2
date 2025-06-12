import { IOccurrencePort } from "@/features/application/ports/IOccurrencePort"
import { Occurrence } from "../../entities/Occurrence"

export class GetOccurrencesUseCase {
  constructor(private readonly occurrencePort: IOccurrencePort) {}

  async execute(): Promise<Occurrence[]> {
    return this.occurrencePort.getOccurrences()
  }
} 