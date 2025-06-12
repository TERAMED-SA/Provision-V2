import { ISupervisorPort } from "@/features/application/ports/ISupervisorPort"
import { Supervisor } from "../../entities/Supervisor"

export class UpdateSupervisorUseCase {
  constructor(private readonly supervisorPort: ISupervisorPort) {}

  async execute(id: string, supervisor: Partial<Supervisor>): Promise<Supervisor> {
    return this.supervisorPort.updateSupervisor(id, supervisor)
  }
} 