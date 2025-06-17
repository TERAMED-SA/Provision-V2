import { useState, useEffect, useCallback } from 'react';
import { startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import instance from '@/lib/api';

interface BaseItem {
  _id?: string;
  id?: string;
  createdAt: string;
  createdAtDate: Date;
  supervisorName?: string;
  name?: string;
}

interface RealTimeData {
  supervisions: number;
  occurrences: number;
  totalSupervisions: number;
  totalOccurrences: number;
  notifications: any[];
  supervisionDetails: BaseItem[];
  occurrenceDetails: BaseItem[];
}

export const useRealTimeUpdates = () => {
  const [data, setData] = useState<RealTimeData>({
    supervisions: 0,
    occurrences: 0,
    totalSupervisions: 0,
    totalOccurrences: 0,
    notifications: [],
    supervisionDetails: [],
    occurrenceDetails: []
  });

  const [previousData, setPreviousData] = useState<RealTimeData>({
    supervisions: 0,
    occurrences: 0,
    totalSupervisions: 0,
    totalOccurrences: 0,
    notifications: [],
    supervisionDetails: [],
    occurrenceDetails: []
  });

  const processItemDate = useCallback((item: any): BaseItem | null => {
    try {
      let createdAtDate: Date | null = null;
      
      if (item.createdAt) {
        const dateString = item.createdAt.toString();
        createdAtDate = new Date(dateString);
        if (isNaN(createdAtDate.getTime())) {
          createdAtDate = new Date(dateString.replace(/\s/, 'T'));
          
          if (isNaN(createdAtDate.getTime())) {
            console.warn('Data inválida encontrada:', item.createdAt);
            return null;
          }
        }
      } else {
        console.warn('Item sem data de criação:', item);
        return null;
      }

      return {
        ...item,
        createdAtDate,
        supervisorName: item.supervisorName || "N/A",
        name: item.name || "N/A",
      };
    } catch (error) {
      console.warn('Erro ao processar item:', error, item);
      return null;
    }
  }, []);

  const getDateRange = useCallback(() => {
    const now = new Date();
    return {
      start: startOfDay(now),
      end: endOfDay(now)
    };
  }, []);

  const fetchData = async () => {
    try {
      const { start, end } = getDateRange();

      // Fetch supervisions
      const supervisionsResponse = await instance.get('/supervision', {
        params: {
          size: 10000,
          sort: 'createdAt',
          order: 'desc'
        }
      });

      // Fetch occurrences
      const occurrencesResponse = await instance.get('/occurrence', {
        params: {
          size: 10000,
          sort: 'createdAt',
          order: 'desc'
        }
      });

      // Process and filter data
      const processedSupervisions = (supervisionsResponse.data?.data?.data || [])
        .map(processItemDate)
        .filter(Boolean) as BaseItem[];

      const processedOccurrences = (occurrencesResponse.data?.data?.data || [])
        .map(processItemDate)
        .filter(Boolean) as BaseItem[];

      // Filter for today's data
      const todaySupervisions = processedSupervisions.filter(item => 
        item.createdAtDate >= start && item.createdAtDate <= end
      );

      const todayOccurrences = processedOccurrences.filter(item => 
        item.createdAtDate >= start && item.createdAtDate <= end
      );

      // Create notifications from today's activities
      const todayNotifications = [
        ...todaySupervisions.map(supervision => ({
          id: supervision._id || supervision.id,
          type: 'supervision',
          title: 'Nova Supervisão',
          description: `Supervisão realizada por ${supervision.supervisorName} em ${supervision.name}`,
          siteName: supervision.name,
          supervisorName: supervision.supervisorName,
          createdAt: supervision.createdAt,
          data: supervision // Include full data for modal
        })),
        ...todayOccurrences.map(occurrence => ({
          id: occurrence._id || occurrence.id,
          type: 'occurrence',
          title: 'Nova Ocorrência',
          description: `Ocorrência registrada por ${occurrence.supervisorName} em ${occurrence.name}`,
          siteName: occurrence.name,
          supervisorName: occurrence.supervisorName,
          createdAt: occurrence.createdAt,
          data: occurrence // Include full data for modal
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const newData = {
        supervisions: todaySupervisions.length,
        occurrences: todayOccurrences.length,
        totalSupervisions: processedSupervisions.length,
        totalOccurrences: processedOccurrences.length,
        notifications: todayNotifications,
        supervisionDetails: todaySupervisions,
        occurrenceDetails: todayOccurrences
      };

      // Check for new activities and show toasts
      if (newData.supervisions > previousData.supervisions) {
        const newSupervisions = newData.supervisions - previousData.supervisions;
        const latestSupervision = newData.supervisionDetails[0];
        
        if (latestSupervision && latestSupervision._id) {
          toast.info(`Nova${newSupervisions > 1 ? 's' : ''} supervisão${newSupervisions > 1 ? 'es' : ''} registrada${newSupervisions > 1 ? 's' : ''}!`, {
            description: `${newSupervisions} nova${newSupervisions > 1 ? 's' : ''} supervisão${newSupervisions > 1 ? 'es' : ''} adicionada${newSupervisions > 1 ? 's' : ''} hoje por ${latestSupervision.supervisorName} em ${latestSupervision.name}.`,
            action: {
              label: "Ver detalhes",
              onClick: () => {
                const url = `/dashboard/supervisao?id=${latestSupervision._id}`;
                window.location.href = url;
                // Dispatch event to open modal
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('view-supervisor-detail', { 
                    detail: latestSupervision 
                  }));
                }, 100);
              }
            },
            duration: 5000,
            position: "top-right"
          });
        }
      }

      if (newData.occurrences > previousData.occurrences) {
        const newOccurrences = newData.occurrences - previousData.occurrences;
        const latestOccurrence = newData.occurrenceDetails[0];
        
        if (latestOccurrence && latestOccurrence._id) {
          toast.info(`Nova${newOccurrences > 1 ? 's' : ''} ocorrência${newOccurrences > 1 ? 's' : ''} registrada${newOccurrences > 1 ? 's' : ''}!`, {
            description: `${newOccurrences} nova${newOccurrences > 1 ? 's' : ''} ocorrência${newOccurrences > 1 ? 's' : ''} adicionada${newOccurrences > 1 ? 's' : ''} hoje por ${latestOccurrence.supervisorName} em ${latestOccurrence.name}.`,
            action: {
              label: "Ver detalhes",
              onClick: () => {
                const url = `/dashboard/ocorrencias?id=${latestOccurrence._id}`;
                window.location.href = url;
                // Dispatch event to open modal
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('view-occurrence-detail', { 
                    detail: latestOccurrence 
                  }));
                }, 5000);
              }
            },
            duration: 5000,
            position: "top-right"
          });
        }
      }

      setPreviousData(newData);
      setData(newData);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); 
    return () => clearInterval(interval);
  }, []);

  return data;
}; 