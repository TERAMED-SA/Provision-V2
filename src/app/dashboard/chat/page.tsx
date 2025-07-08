"use client"

import ChatInterface from "@/components/dashboard/chats/chat-interface"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from 'react';
import { useRealTime } from '@/features/application/infrastructure/realTime/RealTimeProvider';
import { ChatService } from '@/features/application/domain/realTime/ChatService';

export default function Chat() {
 const { user } = useAuth();


  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Acesso Negado</p>
          <p className="text-gray-600">Você precisa estar logado para acessar o chat</p>
        </div>
      </div>
    )
  }

  const realTime = useRealTime();
  const userId = 'user-123'; // Substitua pelo ID real do usuário logado
  const chatServiceRef = useRef<ChatService | null>(null);

  useEffect(() => {
    // Instancia o serviço de chat com o adaptador injetado
    chatServiceRef.current = new ChatService(realTime, userId);
    chatServiceRef.current.connect();

    // Exemplo: escutar mensagens recebidas
    const handleMessage = (msg: any) => {
      console.log('Mensagem recebida:', msg);
    };
    chatServiceRef.current.onMessageReceived(handleMessage);

    // Exemplo: escutar typing
    const handleTyping = (data: any) => {
      console.log('Usuário está digitando:', data);
    };
    chatServiceRef.current.onUserTyping(handleTyping);

    // Cleanup
    return () => {
      chatServiceRef.current?.offMessageReceived(handleMessage);
      chatServiceRef.current?.offUserTyping(handleTyping);
      chatServiceRef.current?.disconnect();
    };
  }, [realTime, userId]);

  // Exemplo de envio de mensagem
  const sendMessage = () => {
    chatServiceRef.current?.sendMessage('room-1', 'Olá mundo!');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 h-screen">
      <ChatInterface
        currentUser={{
          id: user.id,
          mecCoordinator: user.mecCoordinator,
          employeeId: user.employeeId,
          name: user.name || `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
        }}
      />
      <h1>Exemplo de Chat com RealTimePort</h1>
      <button onClick={sendMessage}>Enviar mensagem</button>
      {/* Aqui você pode renderizar a lista de mensagens, input, etc. */}
    </Card>
  )
}