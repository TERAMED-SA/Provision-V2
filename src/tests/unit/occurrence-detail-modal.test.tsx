import React from 'react';
import { render, screen } from '@testing-library/react';
import { OccurrenceDetailModal } from '@/components/dashboard/data-table/occurrence-detail-modal';
import { Occurrence } from '@/features/application/domain/entities/Occurrence';

describe('OccurrenceDetailModal Component', () => {
  const mockOccurrence: Occurrence = {
    _id: '1',
    createdAt: '01/01/2024',
    createdAtTime: '10:00',
    createdAtDate: new Date(),
    siteName: 'Site 1',
    costCenter: 'CC1',
    supervisorName: 'Supervisor 1',
    priority: 'BAIXA',
    details: 'Detalhes 1',
    workers: [
      {
        name: 'Worker 1',
        role: 'Role 1',
        document: '12345678900'
      }
    ],
    equipment: [
      {
        name: 'Equipment 1',
        type: 'Type 1',
        serialNumber: 'SN123'
      }
    ]
  };

  it('deve renderizar o modal com os detalhes da ocorrência', () => {
    render(
      <OccurrenceDetailModal
        occurrence={mockOccurrence}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Detalhes da Ocorrência')).toBeInTheDocument();
    expect(screen.getByText('Site 1')).toBeInTheDocument();
    expect(screen.getByText('CC1')).toBeInTheDocument();
    expect(screen.getByText('Supervisor 1')).toBeInTheDocument();
    expect(screen.getByText('BAIXA')).toBeInTheDocument();
    expect(screen.getByText('Detalhes 1')).toBeInTheDocument();
  });

  it('deve exibir informações dos trabalhadores', () => {
    render(
      <OccurrenceDetailModal
        occurrence={mockOccurrence}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Worker 1')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('12345678900')).toBeInTheDocument();
  });

  it('deve exibir informações dos equipamentos', () => {
    render(
      <OccurrenceDetailModal
        occurrence={mockOccurrence}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Equipment 1')).toBeInTheDocument();
    expect(screen.getByText('Type 1')).toBeInTheDocument();
    expect(screen.getByText('SN123')).toBeInTheDocument();
  });

  it('deve não renderizar o modal quando isOpen é false', () => {
    render(
      <OccurrenceDetailModal
        occurrence={mockOccurrence}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(screen.queryByText('Detalhes da Ocorrência')).not.toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão de fechar', () => {
    const onClose = jest.fn();
    render(
      <OccurrenceDetailModal
        occurrence={mockOccurrence}
        isOpen={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    closeButton.click();

    expect(onClose).toHaveBeenCalled();
  });

  it('deve exibir mensagem quando não houver trabalhadores', () => {
    const occurrenceWithoutWorkers = {
      ...mockOccurrence,
      workers: []
    };

    render(
      <OccurrenceDetailModal
        occurrence={occurrenceWithoutWorkers}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Nenhum trabalhador registrado')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não houver equipamentos', () => {
    const occurrenceWithoutEquipment = {
      ...mockOccurrence,
      equipment: []
    };

    render(
      <OccurrenceDetailModal
        occurrence={occurrenceWithoutEquipment}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Nenhum equipamento registrado')).toBeInTheDocument();
  });
}); 