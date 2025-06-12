import { ChatFactory } from '../../features/application/infrastructure/factories/ChatFactory';
import { CurrentUser, Message, Supervisor } from '../../features/application/domain/entities/Chat';

describe('Chat', () => {
  const chatPort = ChatFactory.getChatPort();
  const mockSupervisor: Supervisor = {
    id: '1',
    employeeId: 'EMP001',
    mecCoordinator: 'coord1',
    name: 'Test Supervisor',
    email: 'supervisor@example.com',
    status: 'online'
  };

  const mockMessage: Message = {
    id: '1',
    senderId: 'user1',
    receiverId: 'supervisor1',
    content: 'Test message',
    timestamp: new Date().toISOString(),
    status: 'sent',
    isUser: true
  };

  it('deve retornar lista de supervisores', async () => {
    const supervisors = await chatPort.getSupervisors();
    expect(Array.isArray(supervisors)).toBe(true);
  });

  it('deve enviar mensagem', async () => {
    const message = await chatPort.sendMessage(mockSupervisor.id, 'Test message');
    expect(message.content).toBe('Test message');
    expect(message.senderId).toBeDefined();
    expect(message.receiverId).toBe(mockSupervisor.id);
  });

  it('deve marcar mensagens como lidas', async () => {
    await expect(chatPort.markMessagesAsRead(mockSupervisor.id)).resolves.not.toThrow();
  });

  it('deve obter contagem de mensagens não lidas', async () => {
    const unreadCount = await chatPort.getUnreadCount(mockSupervisor.id);
    expect(typeof unreadCount).toBe('number');
    expect(unreadCount).toBeGreaterThanOrEqual(0);
  });
}); 