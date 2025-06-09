import * as XLSX from 'xlsx';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { createElement } from 'react';

// Interfaces
interface SiteData {
  siteCostcenter: string;
  siteName: string;
  siteNumberOfWorkers: number;
  supervisor: {
    name: string;
    employeeId: string;
  };
  totalEquipments: number;
  totalSupervisions: number;
  totalOccurrences: number;
}

interface MetricsData {
  company?: number;
  totalSites?: number;
  equipments?: number;
  employees?: number;
  supervisions?: number;
  occurrences?: number;
  tasks?: number;
  users?: number;
  sites?: SiteData[];
}

// Estilos para PDF
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  metricLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 11,
    color: '#1f2937',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

// Componente PDF
const PDFDocument = ({ metrics, generatedAt }: { metrics: MetricsData; generatedAt: string }) =>
  createElement(Document, {},
    createElement(Page, { size: 'A4', style: pdfStyles.page },
      // Header
      createElement(View, { style: pdfStyles.header },
        createElement(Text, { style: pdfStyles.title }, 'Dashboard de Analytics'),
        createElement(Text, { style: pdfStyles.subtitle }, 
          `Relatório gerado em: ${generatedAt}`
        )
      ),

      // Métricas Gerais
      createElement(View, { style: pdfStyles.section },
        createElement(Text, { style: pdfStyles.sectionTitle }, 'Métricas Gerais'),
        
        createElement(View, { style: pdfStyles.row },
          createElement(Text, { style: pdfStyles.metricLabel }, 'Total de Empresas'),
          createElement(Text, { style: pdfStyles.metricValue }, 
            (metrics.company || 0).toLocaleString('pt-BR')
          )
        ),
        
        createElement(View, { style: pdfStyles.row },
          createElement(Text, { style: pdfStyles.metricLabel }, 'Total de Sites'),
          createElement(Text, { style: pdfStyles.metricValue }, 
            (metrics.totalSites || 0).toLocaleString('pt-BR')
          )
        ),
        
        createElement(View, { style: pdfStyles.row },
          createElement(Text, { style: pdfStyles.metricLabel }, 'Total de Equipamentos'),
          createElement(Text, { style: pdfStyles.metricValue }, 
            (metrics.equipments || 0).toLocaleString('pt-BR')
          )
        ),
        
        createElement(View, { style: pdfStyles.row },
          createElement(Text, { style: pdfStyles.metricLabel }, 'Total de Usuários'),
          createElement(Text, { style: pdfStyles.metricValue }, 
            (metrics.users || 0).toLocaleString('pt-BR')
          )
        ),
        
        createElement(View, { style: pdfStyles.row },
          createElement(Text, { style: pdfStyles.metricLabel }, 'Total de Supervisões'),
          createElement(Text, { style: pdfStyles.metricValue }, 
            (metrics.supervisions || 0).toLocaleString('pt-BR')
          )
        ),
        
        createElement(View, { style: pdfStyles.row },
          createElement(Text, { style: pdfStyles.metricLabel }, 'Total de Ocorrências'),
          createElement(Text, { style: pdfStyles.metricValue }, 
            (metrics.occurrences || 0).toLocaleString('pt-BR')
          )
        )
      ),

      // Detalhes dos Sites
      metrics.sites && metrics.sites.length > 0 && 
      createElement(View, { style: pdfStyles.section },
        createElement(Text, { style: pdfStyles.sectionTitle }, 'Detalhes dos Sites'),
        
        createElement(View, { style: pdfStyles.table },
          // Header da tabela
          createElement(View, { style: pdfStyles.tableHeader },
            createElement(Text, { style: pdfStyles.tableCellHeader }, 'Site'),
            createElement(Text, { style: pdfStyles.tableCellHeader }, 'Centro de Custo'),
            createElement(Text, { style: pdfStyles.tableCellHeader }, 'Trabalhadores'),
            createElement(Text, { style: pdfStyles.tableCellHeader }, 'Equipamentos'),
            createElement(Text, { style: pdfStyles.tableCellHeader }, 'Supervisões'),
            createElement(Text, { style: pdfStyles.tableCellHeader }, 'Ocorrências')
          ),
          
          // Linhas da tabela
          ...metrics.sites.slice(0, 15).map((site, index) =>
            createElement(View, { key: index, style: pdfStyles.tableRow },
              createElement(Text, { style: pdfStyles.tableCell }, 
                site.siteName.length > 15 ? site.siteName.substring(0, 15) + '...' : site.siteName
              ),
              createElement(Text, { style: pdfStyles.tableCell }, site.siteCostcenter),
              createElement(Text, { style: pdfStyles.tableCell }, 
                site.siteNumberOfWorkers.toString()
              ),
              createElement(Text, { style: pdfStyles.tableCell }, 
                site.totalEquipments.toString()
              ),
              createElement(Text, { style: pdfStyles.tableCell }, 
                site.totalSupervisions.toString()
              ),
              createElement(Text, { style: pdfStyles.tableCell }, 
                site.totalOccurrences.toString()
              )
            )
          )
        )
      ),

      // Footer
      createElement(View, { style: pdfStyles.footer },
        createElement(Text, {}, 'Dashboard de Analytics - Prometeus')
      )
    )
  );

// Função para exportar para Excel
export const exportToExcel = (metrics: MetricsData) => {
  try {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Aba 1: Métricas Gerais
    const metricsData = [
      ['Métrica', 'Valor'],
      ['Total de Empresas', metrics.company || 0],
      ['Total de Sites', metrics.totalSites || 0],
      ['Total de Equipamentos', metrics.equipments || 0],
      ['Total de Usuários', metrics.users || 0],
      ['Total de Supervisões', metrics.supervisions || 0],
      ['Total de Ocorrências', metrics.occurrences || 0],
      ['Total de Tarefas', metrics.tasks || 0],
    ];
    
    const wsMetrics = XLSX.utils.aoa_to_sheet(metricsData);
    
    // Formatação da aba de métricas
    wsMetrics['!cols'] = [
      { width: 25 },
      { width: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métricas Gerais');
    
    // Aba 2: Detalhes dos Sites (se disponível)
    if (metrics.sites && metrics.sites.length > 0) {
      const sitesData = [
        [
          'Nome do Site',
          'Centro de Custo', 
          'Supervisor',
          'ID do Supervisor',
          'Nº Trabalhadores',
          'Total Equipamentos',
          'Total Supervisões',
          'Total Ocorrências'
        ],
        ...metrics.sites.map(site => [
          site.siteName,
          site.siteCostcenter,
          site.supervisor.name,
          site.supervisor.employeeId,
          site.siteNumberOfWorkers,
          site.totalEquipments,
          site.totalSupervisions,
          site.totalOccurrences
        ])
      ];
      
      const wsSites = XLSX.utils.aoa_to_sheet(sitesData);
      
      // Formatação da aba de sites
      wsSites['!cols'] = [
        { width: 25 }, // Nome do Site
        { width: 15 }, // Centro de Custo
        { width: 20 }, // Supervisor
        { width: 15 }, // ID Supervisor
        { width: 15 }, // Nº Trabalhadores
        { width: 15 }, // Total Equipamentos
        { width: 15 }, // Total Supervisões
        { width: 15 }  // Total Ocorrências
      ];
      
      XLSX.utils.book_append_sheet(wb, wsSites, 'Detalhes dos Sites');
    }
    
    // Gerar arquivo
    const fileName = `dashboard-analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    return { success: false, error: 'Erro ao gerar arquivo Excel' };
  }
};

// Função para exportar para PDF
export const exportToPDF = async (metrics: MetricsData) => {
  try {
    const generatedAt = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Gerar PDF
    const doc = PDFDocument({ metrics, generatedAt });
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    
    // Download do arquivo
    const fileName = `dashboard-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    return { success: false, error: 'Erro ao gerar arquivo PDF' };
  }
};

// Função para calcular eficiência
export const calculateEfficiency = (metrics: MetricsData): string => {
  if (!metrics) return "0%";
  
  const total = (metrics.supervisions || 0) + (metrics.occurrences || 0);
  if (total === 0) return "100%";
  
  const efficiency = ((metrics.supervisions || 0) / total) * 100;
  return `${efficiency.toFixed(1)}%`;
};