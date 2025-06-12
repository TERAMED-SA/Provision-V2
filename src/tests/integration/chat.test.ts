import { ChatFactory } from '../../features/application/infrastructure/factories/ChatFactory';
import { CurrentUser, Message, Supervisor } from '../../features/application/domain/entities/Chat';

describe('Chat Integration', () => {
  const chatPort = ChatFactory.getChatPort();
  let testUser: CurrentUser;
  let testSupervisor: Supervisor;
  let testMessage: Message;

  beforeAll(async () => {
    // Configurar usuário de teste
    testUser = {
      id: 'user1',
      employeeId: 'EMP001',
      mecCoordinator: 'coord1',
      name: 'Test User',
      email: 'test@example.com'
    };

    // Configurar supervisor de teste
    testSupervisor = {
      id: 'supervisor1',
      employeeId: 'SUP001',
      mecCoordinator: 'coord1',
      name: 'Test Supervisor',
      email: 'supervisor@example.com',
      status: 'online'
    };
  });

  it('deve gerenciar mensagens entre usuário e supervisor', async () => {
    // Enviar mensagem
    const message = await chatPort.sendMessage(testSupervisor.id, 'Test message');
    expect(message.content).toBe('Test message');
    expect(message.senderId).toBe(testUser.id);
    expect(message.receiverId).toBe(testSupervisor.id);
    testMessage = message;

    // Obter mensagens
    const messages = await chatPort.getMessages(testSupervisor.id);
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].content).toBe('Test message');
  });

  it('deve gerenciar status de leitura das mensagens', async () => {
    // Marcar mensagens como lidas
    await chatPort.markMessagesAsRead(testSupervisor.id);

    // Verificar contagem de não lidas
    const unreadCount = await chatPort.getUnreadCount(testSupervisor.id);
    expect(unreadCount).toBe(0);
  });

  it('deve gerenciar lista de supervisores', async () => {
    const supervisors = await chatPort.getSupervisors();
    expect(Array.isArray(supervisors)).toBe(true);
    expect(supervisors.length).toBeGreaterThan(0);

    const supervisor = supervisors.find(s => s.id === testSupervisor.id);
    expect(supervisor).toBeDefined();
    expect(supervisor?.name).toBe(testSupervisor.name);
  });

  it('deve gerenciar envio de arquivos', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const message = await chatPort.sendFile(testSupervisor.id, file);
    
    expect(message.fileName).toBe('test.txt');
    expect(message.fileType).toBe('text/plain');
    expect(message.fileSize).toBeDefined();
  });

  it('deve manter histórico de mensagens', async () => {
    // Enviar múltiplas mensagens
    await chatPort.sendMessage(testSupervisor.id, 'Message 1');
    await chatPort.sendMessage(testSupervisor.id, 'Message 2');
    await chatPort.sendMessage(testSupervisor.id, 'Message 3');

    // Obter histórico
    const messages = await chatPort.getMessages(testSupervisor.id);
    expect(messages.length).toBeGreaterThanOrEqual(3);
    expect(messages[messages.length - 1].content).toBe('Message 3');
  });
}); 