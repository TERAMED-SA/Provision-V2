import { SupervisorFactory } from '../../../application/infrastructure/factories/SupervisorFactory';
import { GetSupervisorsUseCase } from '../../../application/use-cases/supervisor/GetSupervisorsUseCase';
import { CreateSupervisorUseCase } from '../../../application/use-cases/supervisor/CreateSupervisorUseCase';
import { UpdateSupervisorUseCase } from '../../../application/use-cases/supervisor/UpdateSupervisorUseCase';
import { DeleteSupervisorUseCase } from '../../../application/use-cases/supervisor/DeleteSupervisorUseCase';
import { GetSupervisorLocationsUseCase } from '../../../application/use-cases/supervisor/GetSupervisorLocationsUseCase';
import { GetSupervisorAnalyticsUseCase } from '../../../application/use-cases/supervisor/GetSupervisorAnalyticsUseCase';
import { Supervisor } from '../../../application/domain/entities/Supervisor';

describe('Supervisor Integration Tests', () => {
  const supervisorPort = SupervisorFactory.getSupervisorPort();
  const getSupervisorsUseCase = new GetSupervisorsUseCase(supervisorPort);
  const createSupervisorUseCase = new CreateSupervisorUseCase(supervisorPort);
  const updateSupervisorUseCase = new UpdateSupervisorUseCase(supervisorPort);
  const deleteSupervisorUseCase = new DeleteSupervisorUseCase(supervisorPort);
  const getSupervisorLocationsUseCase = new GetSupervisorLocationsUseCase(supervisorPort);
  const getSupervisorAnalyticsUseCase = new GetSupervisorAnalyticsUseCase(supervisorPort);

  let createdSupervisorId: string;

  it('deve criar um novo supervisor', async () => {
    const newSupervisor: Omit<Supervisor, '_id'> = {
      name: 'Supervisor Teste',
      phoneNumber: '123456789',
      email: 'teste@example.com',
      active: true
    };

    const createdSupervisor = await createSupervisorUseCase.execute(newSupervisor);
    createdSupervisorId = createdSupervisor._id;

    expect(createdSupervisor).toMatchObject(newSupervisor);
    expect(createdSupervisor._id).toBeDefined();
  });

  it('deve listar todos os supervisores', async () => {
    const supervisors = await getSupervisorsUseCase.execute();
    expect(Array.isArray(supervisors)).toBe(true);
    expect(supervisors.length).toBeGreaterThan(0);
  });

  it('deve atualizar um supervisor existente', async () => {
    const updateData: Partial<Supervisor> = {
      name: 'Supervisor Atualizado',
      phoneNumber: '987654321'
    };

    const updatedSupervisor = await updateSupervisorUseCase.execute(createdSupervisorId, updateData);
    expect(updatedSupervisor).toMatchObject(updateData);
  });

  it('deve obter localizações dos supervisores', async () => {
    const locations = await getSupervisorLocationsUseCase.execute();
    expect(Array.isArray(locations)).toBe(true);
  });

  it('deve obter analytics dos supervisores', async () => {
    const analytics = await getSupervisorAnalyticsUseCase.execute('day');
    expect(Array.isArray(analytics)).toBe(true);
  });

  it('deve deletar um supervisor', async () => {
    await expect(deleteSupervisorUseCase.execute(createdSupervisorId)).resolves.not.toThrow();
  });
}); 