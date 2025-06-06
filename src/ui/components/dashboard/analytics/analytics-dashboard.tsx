"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Area,
  AreaChart,
} from "recharts";
import {
  Building2,
  MapPin,
  Wrench,
  Users,
  UserCheck,
  Activity,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Search,
  Filter,
  TrendingUp,
} from "lucide-react";
import instance from "@/src/lib/api";
import { calculateEfficiency, exportToExcel, exportToPDF } from "./exportUtils";

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
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
  sites?: SiteData[];
}

interface MetricsCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  delay?: number;
  color?: string;
}

function MetricsCard({
  title,
  subtitle,
  value,
  description,
  icon,
  children,
  delay = 0,
  color = "blue",
}: MetricsCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 p-4 transition-all duration-700 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } hover:shadow-lg hover:-translate-y-1`}
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-600">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="text-gray-600">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold mb-1">
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-16 w-full bg-gray-200 rounded animate-pulse mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"equipments" | "supervisions" | "all">("all");

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instance.get(`/admin/metrics?size=10&page=1`);
      setMetrics(response.data?.data || null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Erro ao carregar métricas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getFilteredSites = () => {
    if (!metrics?.sites) return [];
    
    let filtered = metrics.sites;
    
    if (searchTerm) {
      filtered = filtered.filter(site => 
        site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.supervisor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterBy === "equipments") {
      filtered = filtered.sort((a, b) => b.totalEquipments - a.totalEquipments);
    } else if (filterBy === "supervisions") {
      filtered = filtered.sort((a, b) => b.totalSupervisions - a.totalSupervisions);
    }
    
    return filtered.slice(0, 6);
  };

  const generateSupervisionChartData = () => {
    if (!metrics?.sites) return [];
    
    return metrics.sites.slice(0, 5).map((site, index) => ({
      name: site.siteName.split(" ")[0],
      supervisions: site.totalSupervisions,
      target: Math.floor(site.totalSupervisions * 1.2), 
    }));
  };

  const generateSitesBarChartData = () => {
    const filteredSites = getFilteredSites();
    
    return filteredSites.map((site) => ({
      name: site.siteName.length > 15 ? site.siteName.substring(0, 15) + "..." : site.siteName,
      equipments: site.totalEquipments,
      supervisions: site.totalSupervisions,
      workers: site.siteNumberOfWorkers,
    }));
  };

  const generateSitesChartData = () => {
    if (!metrics?.sites) return [];
    return metrics.sites.slice(0, 4).map((site, index) => ({
      month: `Site ${index + 1}`,
      sites: site.totalEquipments,
    }));
  };

  const generateEquipmentChartData = () => {
    if (!metrics?.sites) return [];
    return metrics.sites.slice(0, 5).map((site, index) => ({
      day: site.siteName.split(" ")[0] || `Site ${index + 1}`,
      equipments: site.totalEquipments,
    }));
  };

 
  const handleExportExcel = async () => {
    if (!metrics) return;

    setExporting("excel");
    try {
      const result = await exportToExcel(metrics);
      if (result.success) {
        console.log(`Arquivo Excel exportado: ${result.fileName}`);
      } else {
        console.error("Erro na exportação:", result.error);
      }
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!metrics) return;

    setExporting("pdf");
    try {
      const result = await exportToPDF(metrics);
      if (result.success) {
        console.log(`Arquivo PDF exportado: ${result.fileName}`);
      } else {
        console.error("Erro na exportação:", result.error);
      }
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Analytics
          </h1>
          <p className="text-red-500">{error}</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Analytics
          </h1>
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const sitesChartData = generateSitesBarChartData();
  const supervisionChartData = generateSupervisionChartData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Analytics
          </h1>
          <p className="text-gray-600">
            Visão geral das métricas e indicadores principais do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting === "excel"}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting === "excel" ? "Exportando..." : "Excel"}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting === "pdf"}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {exporting === "pdf" ? "Exportando..." : "PDF"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total de Empresas"
          value={metrics.company || 0}
          description="empresas cadastradas"
          icon={<Building2 className="h-4 w-4" />}
          delay={100}
          color="blue"
        >
          <div className="h-16 flex items-end justify-between space-x-1">
            {[65, 78, 82, 95, 88, 92, 100].map((height, i) => (
              <div
                key={i}
                className="bg-blue-500 rounded-sm flex-1 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: "2s",
                }}
              />
            ))}
          </div>
        </MetricsCard>

        <MetricsCard
          title="Total de Sites"
          value={metrics.totalSites || 0}
          description="sites monitorados"
          icon={<MapPin className="h-4 w-4" />}
          delay={200}
          color="green"
        >
          <ResponsiveContainer width="100%" height={64}>
            <LineChart data={generateSitesChartData()}>
              <Line
                type="monotone"
                dataKey="sites"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard
          title="Total de Equipamentos"
          value={metrics.equipments || 0}
          description="equipamentos ativos"
          icon={<Wrench className="h-4 w-4" />}
          delay={300}
          color="orange"
        >
          <ResponsiveContainer width="100%" height={64}>
            <BarChart data={generateEquipmentChartData()}>
              <Bar
                dataKey="equipments"
                fill="#f97316"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard
          title="Total de Usuários"
          value={metrics.users || 0}
          description="usuários ativos"
          icon={<Users className="h-4 w-4" />}
          delay={400}
          color="purple"
        >
          <div className="flex items-center justify-center h-16">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">
                  {metrics.users || 0}
                </span>
              </div>
            </div>
          </div>
        </MetricsCard>

        <MetricsCard
          title="Total de Supervisões"
          value={metrics.supervisions || 0}
          description="supervisões realizadas"
          icon={<UserCheck className="h-4 w-4" />}
          delay={500}
          color="blue"
        >
          <ResponsiveContainer width="100%" height={64}>
            <AreaChart data={supervisionChartData}>
              <Area
                type="monotone"
                dataKey="supervisions"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard
          title="Taxa de Eficiência"
          value={calculateEfficiency(metrics)}
          description="eficiência operacional"
          icon={<Activity className="h-4 w-4" />}
          delay={600}
          color="green"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Eficiência</span>
              <span>{calculateEfficiency(metrics)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: calculateEfficiency(metrics) }}
              ></div>
            </div>
          </div>
        </MetricsCard>

        <MetricsCard
          title="Status do Sistema"
          value="Online"
          description="todos os sistemas operacionais"
          icon={<Activity className="h-4 w-4" />}
          delay={700}
          color="green"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">
              Sistema Operacional
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-1 bg-green-500 rounded animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </MetricsCard>
      </div>

      {/* Filtros para Sites */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por site ou supervisor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[250px]"
            />
          </div>
          <div className="relative">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as "equipments" | "supervisions" | "all")}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[200px]"
            >
              <option value="all">Todos os Sites</option>
              <option value="equipments">Mais Equipamentos</option>
              <option value="supervisions">Mais Supervisões</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Gráfico de Sites Melhorado */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Distribuição por Sites</h2>
          </div>
          <p className="text-sm text-gray-600">
            {filterBy === "equipments" && "Sites ordenados por quantidade de equipamentos"}
            {filterBy === "supervisions" && "Sites ordenados por quantidade de supervisões"}
            {filterBy === "all" && `${sitesChartData.length} sites encontrados`}
            {searchTerm && ` - Filtrado por: "${searchTerm}"`}
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={sitesChartData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Bar 
              dataKey="equipments" 
              fill="#3b82f6" 
              radius={[0, 4, 4, 0]}
              name="Equipamentos"
            >
              <LabelList
                dataKey="equipments"
                position="right"
                offset={8}
                className="fill-gray-700"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex gap-2 font-medium items-center">
            Total de {sitesChartData.reduce((sum, site) => sum + site.equipments, 0)} equipamentos
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-gray-600">
            Distribuição de equipamentos por site monitorado
          </div>
        </div>
      </div>
    </div>
  );
}