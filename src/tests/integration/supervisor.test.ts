import { SupervisorFactory } from '../../features/application/infrastructure/factories/SupervisorFactory';
import { Supervisor, SupervisorLocation } from '../../features/application/domain/entities/Supervisor';

describe('Supervisor Integration', () => {
  const supervisorPort = SupervisorFactory.getSupervisorPort();
  let createdSupervisor: Supervisor;

  beforeAll(async () => {
    // Create a test supervisor for integration tests
    createdSupervisor = await supervisorPort.createSupervisor({
      name: 'Integration Test Supervisor',
      phoneNumber: '999888777',
      email: 'integration@test.com',
      active: true,
      employeeId: 'EMP999',
      address: 'Integration Test Address',
      mecCoordinator: 'coord1'
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (createdSupervisor?._id) {
      await supervisorPort.deleteSupervisor(createdSupervisor._id);
    }
  });

  it('deve criar, atualizar e deletar supervisor em sequência', async () => {
    // Create
    const supervisor = await supervisorPort.createSupervisor({
      name: 'Test Flow Supervisor',
      phoneNumber: '111222333',
      email: 'flow@test.com',
      active: true,
      employeeId: 'EMP888',
      address: 'Flow Test Address',
      mecCoordinator: 'coord1'
    });

    expect(supervisor.name).toBe('Test Flow Supervisor');
    expect(supervisor.employeeId).toBe('EMP888');

    // Update
    const updatedSupervisor = await supervisorPort.updateSupervisor(supervisor._id, {
      name: 'Updated Flow Supervisor',
      phoneNumber: '444555666'
    });

    expect(updatedSupervisor.name).toBe('Updated Flow Supervisor');
    expect(updatedSupervisor.phoneNumber).toBe('444555666');

    // Delete
    await expect(supervisorPort.deleteSupervisor(supervisor._id)).resolves.not.toThrow();
  });

  it('deve gerenciar localização e rota do supervisor', async () => {
    const location: SupervisorLocation = {
      employeeId: createdSupervisor.employeeId!,
      userId: createdSupervisor._id,
      name: createdSupervisor.name,
      lat: -8.8368,
      lng: 13.2343,
      time: new Date().toISOString()
    };

    // Update location
    await supervisorPort.updateSupervisorLocation(location);

    // Get locations
    const locations = await supervisorPort.getSupervisorLocations();
    const supervisorLocation = locations.find(l => l.employeeId === location.employeeId);
    expect(supervisorLocation).toBeDefined();
    expect(supervisorLocation?.lat).toBe(location.lat);
    expect(supervisorLocation?.lng).toBe(location.lng);

    // Get route
    const route = await supervisorPort.getSupervisorRoute(location.employeeId);
    expect(typeof route).toBe('object');
  });

  it('deve gerenciar analytics do supervisor', async () => {
    // Get analytics for different time filters
    const dayAnalytics = await supervisorPort.getSupervisorAnalytics('day');
    const weekAnalytics = await supervisorPort.getSupervisorAnalytics('week');
    const monthAnalytics = await supervisorPort.getSupervisorAnalytics('month');

    expect(Array.isArray(dayAnalytics)).toBe(true);
    expect(Array.isArray(weekAnalytics)).toBe(true);
    expect(Array.isArray(monthAnalytics)).toBe(true);

    // Get activity counts
    const dayCount = await supervisorPort.getSupervisorActivityCount('day');
    const weekCount = await supervisorPort.getSupervisorActivityCount('week');
    const monthCount = await supervisorPort.getSupervisorActivityCount('month');

    expect(typeof dayCount).toBe('number');
    expect(typeof weekCount).toBe('number');
    expect(typeof monthCount).toBe('number');
  });
}); 