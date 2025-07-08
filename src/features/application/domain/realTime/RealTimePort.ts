// Hexagonal Port para comunicação em tempo real
// Define o contrato que todos os adaptadores de real-time devem seguir

export interface RealTimePort {
  /**
   * Conecta ao provedor de real-time (ex: Socket.IO, Pusher)
   * @param userId - ID do usuário para autenticação/contexto
   */
  connect(userId: string): void;

  /**
   * Desconecta do provedor de real-time
   */
  disconnect(): void;

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean;

  /**
   * Emite um evento para o servidor
   * @param event - Nome do evento
   * @param payload - Dados a serem enviados
   */
  emit(event: string, payload: any): void;

  /**
   * Inscreve-se em um evento
   * @param event - Nome do evento
   * @param handler - Função callback para tratar o evento
   */
  subscribe(event: string, handler: (data: any) => void): void;

  /**
   * Remove a inscrição de um evento
   * @param event - Nome do evento
   * @param handler - Função callback a ser removida
   */
  unsubscribe(event: string, handler: (data: any) => void): void;
} 