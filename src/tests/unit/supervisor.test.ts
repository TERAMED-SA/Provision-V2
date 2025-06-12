import { SupervisorFactory } from '../../features/application/infrastructure/factories/SupervisorFactory';
import { Supervisor, SupervisorLocation } from '../../features/application/domain/entities/Supervisor';

describe('Supervisor', () => {
  const supervisorPort = SupervisorFactory.getSupervisorPort();
  const mockSupervisor: Supervisor = {
    _id: '1',
    name: 'Test Supervisor',
    phoneNumber: '123456789',
    email: 'test@example.com',
    active: true,
    employeeId: 'EMP001',
    address: 'Test Address',
    createdAt: new Date().toISOString(),
    mecCoordinator: 'coord1'
  };

  const mockLocation: SupervisorLocation = {
    employeeId: 'EMP001',
    userId: '1',
    name: 'Test Supervisor',
    lat: -8.8368,
    lng: 13.2343,
    time: new Date().toISOString()
  };

  it('deve retornar lista de supervisores', async () => {
    const supervisors = await supervisorPort.getSupervisors();
    expect(Array.isArray(supervisors)).toBe(true);
    expect(supervisors.length).toBeGreaterThan(0);
  });

  it('deve criar novo supervisor', async () => {
    const newSupervisor = await supervisorPort.createSupervisor({
      name: 'New Supervisor',
      phoneNumber: '987654321',
      email: 'new@example.com',
      active: true,
      employeeId: 'EMP002',
      address: 'New Address',
      mecCoordinator: 'coord1'
    });
    expect(newSupervisor.name).toBe('New Supervisor');
    expect(newSupervisor.employeeId).toBe('EMP002');
  });

  it('deve atualizar supervisor existente', async () => {
    const updatedSupervisor = await supervisorPort.updateSupervisor(mockSupervisor._id, {
      name: 'Updated Supervisor',
      phoneNumber: '111222333'
    });
    expect(updatedSupervisor.name).toBe('Updated Supervisor');
    expect(updatedSupervisor.phoneNumber).toBe('111222333');
  });

  it('deve obter localizações dos supervisores', async () => {
    const locations = await supervisorPort.getSupervisorLocations();
    expect(Array.isArray(locations)).toBe(true);
  });

  it('deve atualizar localização do supervisor', async () => {
    await expect(supervisorPort.updateSupervisorLocation(mockLocation)).resolves.not.toThrow();
  });

  it('deve obter rota do supervisor', async () => {
    const route = await supervisorPort.getSupervisorRoute(mockLocation.employeeId);
    expect(typeof route).toBe('object');
  });

  it('deve obter analytics do supervisor', async () => {
    const analytics = await supervisorPort.getSupervisorAnalytics('day');
    expect(Array.isArray(analytics)).toBe(true);
  });

  it('deve obter contagem de atividades do supervisor', async () => {
    const count = await supervisorPort.getSupervisorActivityCount('day');
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });
}); 