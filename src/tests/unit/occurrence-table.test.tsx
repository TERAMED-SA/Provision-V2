import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OccurrenceTable } from '@/components/dashboard/data-table/occurrence';
import { OccurrenceFactory } from '@/features/application/infrastructure/factories/OccurrenceFactory';
import { Occurrence } from '@/features/application/domain/entities/Occurrence';

jest.mock('@/features/application/infrastructure/factories/OccurrenceFactory');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('OccurrenceTable Component', () => {
  const mockOccurrences: Occurrence[] = [
    {
      _id: '1',
      createdAt: '01/01/2024',
      createdAtTime: '10:00',
      createdAtDate: new Date(),
      siteName: 'Site 1',
      costCenter: 'CC1',
      supervisorName: 'Supervisor 1',
      priority: 'BAIXA',
      details: 'Detalhes 1'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a tabela de ocorrências corretamente', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockResolvedValue(mockOccurrences)
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      expect(screen.getByText('Ocorrências')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro quando falhar ao carregar ocorrências', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('API Error'))
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar ocorrências')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de detalhes ao clicar no botão de visualizar', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockResolvedValue(mockOccurrences)
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      const viewButton = screen.getByRole('button', { name: /visualizar/i });
      fireEvent.click(viewButton);
    });

    expect(screen.getByText('Detalhes da Ocorrência')).toBeInTheDocument();
  });

  it('deve ordenar ocorrências por data', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockResolvedValue(mockOccurrences)
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      const sortButton = screen.getByRole('button', { name: /data/i });
      fireEvent.click(sortButton);
    });

    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
  });

  it('deve filtrar ocorrências por site', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockResolvedValue(mockOccurrences)
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      const filterInput = screen.getByPlaceholderText(/filtrar por site/i);
      fireEvent.change(filterInput, { target: { value: 'Site 1' } });
    });

    expect(screen.getByText('Site 1')).toBeInTheDocument();
  });
}); 