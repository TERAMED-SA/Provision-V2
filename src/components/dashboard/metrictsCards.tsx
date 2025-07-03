"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Building2, MapPin, Wrench, UserCheck, TrendingUp } from "lucide-react"
import instance from "@/lib/api"

interface SiteData {
  siteCostcenter: string
  siteName: string
  siteNumberOfWorkers: number
  supervisor: {
    name: string
    employeeId: string
  }
  totalEquipments: number
  totalSupervisions: number
  totalOccurrences: number
}

interface MetricsData {
  company?: number
  totalSites?: number
  equipments?: number
  employees?: number
  supervisions?: number
  occurrences?: number
  tasks?: number
  users?: number
  sites?: SiteData[]
}

interface SimpleMetricsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: "up" | "down" | "stable"
  trendValue?: string
  children?: React.ReactNode
  delay?: number
  color?: string
}

function SimpleMetricsCard({
  title,
  value,
  icon,
  trend = "stable",
  trendValue,
  children,
  delay = 0,
  color = "blue",
}: SimpleMetricsCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  }

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    stable: "text-gray-600",
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-500 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } hover:shadow-md hover:border-gray-200`}
    >
      <div className="flex flex-row items-center gap-4 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>{icon}</div>
        <div className="flex flex-col flex-1">
          <h3 className="text-sm font-medium text-gray-600">Total de {title}</h3>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
        </div>
        {trendValue && (
          <div className={`flex items-center text-xs font-medium ${trendColors[trend]}`}> 
            <TrendingUp className="h-3 w-3 mr-1" />
            {trendValue}
          </div>
        )}
      </div>
      {children && <div className="mt-3 h-12">{children}</div>}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-500 ease-out transform hover:shadow-md hover:border-gray-200">
          <div className="flex flex-row items-center gap-4 mb-3">
            <div className="p-2 rounded-lg bg-gray-200 h-10 w-10 animate-pulse"></div>
            <div className="flex flex-col flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-7 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SimpleMetricsCards() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await instance.get(`/admin/metrics?size=10&page=1`)
      setMetrics(response.data?.data || null)
    } catch (err) {
      console.error("Error fetching metrics:", err)
      setError("Erro ao carregar métricas.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])



  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
      <SimpleMetricsCard
        title="Empresas"
        value={metrics.company || 0}
        icon={<Building2 className="h-6 w-6" />}
        trend="up"
        delay={0}
        color="blue"
      />
      <SimpleMetricsCard
        title="Sites"
        value={metrics.totalSites || 0}
        icon={<MapPin className="h-6 w-6" />}
        trend="up"
        delay={100}
        color="green"
      />
      <SimpleMetricsCard
        title="Equipamentos"
        value={metrics.equipments || 0}
        icon={<Wrench className="h-6 w-6" />}
        trend="stable"
        delay={200}
        color="orange"
      />
      <SimpleMetricsCard
        title="Supervisões"
        value={metrics.supervisions || 0}
        icon={<UserCheck className="h-6 w-6" />}
        trend="up"
        delay={300}
        color="purple"
      />
    </div>
  )
}
