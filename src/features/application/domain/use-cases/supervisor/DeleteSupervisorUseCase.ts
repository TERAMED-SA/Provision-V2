import { ISupervisorPort } from "@/features/application/ports/ISupervisorPort";

export class DeleteSupervisorUseCase {
  constructor(private readonly supervisorPort: ISupervisorPort) {}

  async execute(id: string): Promise<void> {
    return this.supervisorPort.deleteSupervisor(id)
  }
} 