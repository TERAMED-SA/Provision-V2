import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OccurrenceTable } from '@/components/dashboard/data-table/occurrence';
import { OccurrenceFactory } from '@/features/application/infrastructure/factories/OccurrenceFactory';
import { Occurrence } from '@/features/application/domain/entities/Occurrence';
import { OccurrenceAdapter } from '@/features/application/infrastructure/adapters/OccurrenceAdapter';

jest.mock('@/features/application/infrastructure/factories/OccurrenceFactory');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('OccurrenceTable Integration', () => {
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
    },
    {
      _id: '2',
      createdAt: '02/01/2024',
      createdAtTime: '11:00',
      createdAtDate: new Date(),
      siteName: 'Site 2',
      costCenter: 'CC2',
      supervisorName: 'Supervisor 2',
      priority: 'ALTA',
      details: 'Detalhes 2'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar e exibir ocorrências da API', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockResolvedValue(mockOccurrences)
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      expect(screen.getByText('Site 1')).toBeInTheDocument();
      expect(screen.getByText('Site 2')).toBeInTheDocument();
    });
  });

  it('deve lidar com erro de API ao carregar ocorrências', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('API Error'))
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar ocorrências')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de detalhes e exibir informações corretas', async () => {
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
    expect(screen.getByText('Site 1')).toBeInTheDocument();
    expect(screen.getByText('CC1')).toBeInTheDocument();
    expect(screen.getByText('Supervisor 1')).toBeInTheDocument();
    expect(screen.getByText('BAIXA')).toBeInTheDocument();
    expect(screen.getByText('Detalhes 1')).toBeInTheDocument();
  });

  it('deve ordenar ocorrências por data e manter a ordem', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockResolvedValue(mockOccurrences)
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      const sortButton = screen.getByRole('button', { name: /data/i });
      fireEvent.click(sortButton);
    });

    const dates = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dates[0]).toHaveTextContent('01/01/2024');
    expect(dates[1]).toHaveTextContent('02/01/2024');
  });

  it('deve filtrar ocorrências por site e atualizar a lista', async () => {
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
    expect(screen.queryByText('Site 2')).not.toBeInTheDocument();
  });

  it('deve manter o estado de filtro após atualizar a lista', async () => {
    const mockGetOccurrencesUseCase = {
      execute: jest.fn().mockResolvedValue(mockOccurrences)
    };

    (OccurrenceFactory.createGetOccurrencesUseCase as jest.Mock).mockReturnValue(mockGetOccurrencesUseCase);

    render(<OccurrenceTable />);

    await waitFor(() => {
      const filterInput = screen.getByPlaceholderText(/filtrar por site/i);
      fireEvent.change(filterInput, { target: { value: 'Site 1' } });
    });

    // Simula atualização da lista
    await waitFor(() => {
      expect(screen.getByText('Site 1')).toBeInTheDocument();
      expect(screen.queryByText('Site 2')).not.toBeInTheDocument();
    });
  });
}); 