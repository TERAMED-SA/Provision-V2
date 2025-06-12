import React from 'react';
import { render, screen } from '@testing-library/react';
import { OccurrencePDF } from '@/components/dashboard/pdf/occurrence-pdf';
import { Occurrence } from '@/features/application/domain/entities/Occurrence';

describe('OccurrencePDF Component', () => {
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

  it('deve renderizar o PDF com os detalhes da ocorrência', () => {
    render(<OccurrencePDF occurrence={mockOccurrence} />);

    expect(screen.getByText('RELATÓRIO DE OCORRÊNCIA')).toBeInTheDocument();
    expect(screen.getByText('Site 1')).toBeInTheDocument();
    expect(screen.getByText('CC1')).toBeInTheDocument();
    expect(screen.getByText('Supervisor 1')).toBeInTheDocument();
    expect(screen.getByText('BAIXA')).toBeInTheDocument();
    expect(screen.getByText('Detalhes 1')).toBeInTheDocument();
  });

  it('deve exibir informações dos trabalhadores', () => {
    render(<OccurrencePDF occurrence={mockOccurrence} />);

    expect(screen.getByText('TRABALHADORES')).toBeInTheDocument();
    expect(screen.getByText('Worker 1')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('12345678900')).toBeInTheDocument();
  });

  it('deve exibir informações dos equipamentos', () => {
    render(<OccurrencePDF occurrence={mockOccurrence} />);

    expect(screen.getByText('EQUIPAMENTOS')).toBeInTheDocument();
    expect(screen.getByText('Equipment 1')).toBeInTheDocument();
    expect(screen.getByText('Type 1')).toBeInTheDocument();
    expect(screen.getByText('SN123')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não houver trabalhadores', () => {
    const occurrenceWithoutWorkers = {
      ...mockOccurrence,
      workers: []
    };

    render(<OccurrencePDF occurrence={occurrenceWithoutWorkers} />);

    expect(screen.getByText('Nenhum trabalhador registrado')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não houver equipamentos', () => {
    const occurrenceWithoutEquipment = {
      ...mockOccurrence,
      equipment: []
    };

    render(<OccurrencePDF occurrence={occurrenceWithoutEquipment} />);

    expect(screen.getByText('Nenhum equipamento registrado')).toBeInTheDocument();
  });

  it('deve exibir a data e hora da ocorrência', () => {
    render(<OccurrencePDF occurrence={mockOccurrence} />);

    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('deve exibir o rodapé com a data de geração', () => {
    render(<OccurrencePDF occurrence={mockOccurrence} />);

    const today = new Date().toLocaleDateString('pt-BR');
    expect(screen.getByText(`Gerado em ${today}`)).toBeInTheDocument();
  });
}); 