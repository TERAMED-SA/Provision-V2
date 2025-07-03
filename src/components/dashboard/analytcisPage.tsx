"use client"

import { useState } from "react"
import {  Calendar, Filter, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts"
import * as XLSX from "xlsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { companyAdapter } from "@/features/application/infrastructure/factories/CompanyFactory"
import { useSupervisionStore } from "@/hooks/useDataStore"
import instance from "@/lib/api"
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory"
import { useQuery } from "@tanstack/react-query"
import React from "react"

const months = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
]

const years = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i
  return { value: year.toString(), label: year.toString() }
})

interface ChartData {
  name: string
  value: number
  fill: string
}


const chartConfigs: Record<string, ChartConfig> = {
  clientes: {
    value: { label: "Clientes" },
  },
  sites: {
    value: { label: "Sites" },
  },
  supervisores: {
    value: { label: "Supervisores" },
  },
  supervisao: {
    value: { label: "Supervisão" },
  },
}

function AnalyticsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 flex-1" />
            </div>
          ))}
        </div>
      
      </CardContent>
    </Card>
  )
}

interface AnalyticsCardProps {
  title: string
  description: string
  data: ChartData[]
  type: string
  formatValue?: (value: number) => string
  maxBars?: number
  renderBarLabel?: boolean
  customTooltip?: any
  children?: React.ReactNode
}

function AnalyticsCard({
  title,
  description,
  data,
  type,
  formatValue = (value) => value.toString(),
  maxBars = 0,
  renderBarLabel = false,
  customTooltip,
  children,
}: AnalyticsCardProps & { renderBarLabel?: boolean, customTooltip?: any, children?: React.ReactNode }) {
  const chartConfig = chartConfigs[type] || chartConfigs.clientes
  const [expanded, setExpanded] = useState(false)

  const abbreviatedData = data.map(item => {
    let name = item.name
    if (type === 'clientes') {
      name = item.name.split(" ")[0] // só o primeiro nome
    } else {
      const words = item.name.split(" ")
      name = words.length <= 2 ? item.name : words.slice(0, 1).join("") + '...'
    }
    return {
      ...item,
      name,
      fullName: item.name, // para tooltip
    }
  })

  const displayData = !expanded && maxBars > 0 ? abbreviatedData.slice(0, maxBars) : abbreviatedData

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mb-2" />
            <span>Não há dados para o mês ou ano selecionado.</span>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={displayData}
              layout="vertical"
              barSize={18}
              height={Math.max(160, displayData.length * 32)}
              margin={{ left: 0, top: 10, bottom: 10 }}
            >
              <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={80} />
              <XAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={customTooltip ? customTooltip : <ChartTooltipContent hideLabel />}
                formatter={(value) => [formatValue(Number(value)), ""]}
              />
              <Bar dataKey="value" layout="vertical" radius={5} fill="#FF8800">
                {renderBarLabel && (
                  <LabelList dataKey="value" position="center" style={{ fill: '#fff', fontWeight: 'bold' }} />
                )}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

function ClientTooltipContent({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const { fullName,  topSupervisorName, topZone, totalSites } = payload[0].payload
  return (
    <div className="p-2 bg-white dark:bg-gray-900 rounded shadow text-xs">
      <div><b>Cliente:</b> {fullName}</div>
      <div><b>Total de Sites:</b> {totalSites}</div>
      {topSupervisorName && <div><b>Supervisor com mais sites:</b> {topSupervisorName}</div>}
      {topZone && <div><b>Zona com mais sites:</b> {topZone}</div>}
    </div>
  )
}

function SupervisionTooltipContent({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const { fullName, value, topSupervisorName } = payload[0].payload
  return (
    <div className="p-2 bg-white dark:bg-gray-900 rounded shadow text-xs">
      <div><b>Site:</b> {fullName}</div>
      <div><b>Supervisões:</b> {value}</div>
      {topSupervisorName && <div><b>Supervisor que mais supervisionou:</b> {topSupervisorName}</div>}
    </div>
  )
}

// Hook para buscar companies
function useCompaniesQuery() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      return await companyAdapter.getCompanies()
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar sites
function useSitesQuery() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const response = await instance.get("/companySite?size=500")
      return response.data.data.data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar users
function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await userAdapter.getUsers()
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Novo hook para controlar expansão incremental
function useExpandIncremental(total: number, initial: number, step: number) {
  const [count, setCount] = useState(initial)
  const canExpand = count < total
  const canCollapse = count > initial
  const showCount = Math.min(count, total)
  const expand = () => setCount((c) => Math.min(c + step, total))
  const collapse = () => setCount(initial)
  return { showCount, canExpand, canCollapse, expand, collapse }
}

export default function AnalyticsDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const { supervisions, occurrences } = useSupervisionStore()

  // React Query hooks
  const { data: companies = [], isLoading: loadingCompanies } = useCompaniesQuery()
  const { data: sites = [], isLoading: loadingSites } = useSitesQuery()
  const { data: users = [], isLoading: loadingUsers } = useUsersQuery()

  const loading = loadingCompanies || loadingSites || loadingUsers

  // Memo para processar os dados filtrados
  const data = React.useMemo(() => {
    if (loading) return null
    // Filtro de datas
    const month = Number(selectedMonth)
    const year = Number(selectedYear)

    // Filtrar supervisions e occurrences pelo mês/ano
    const filteredSupervisions = supervisions.filter(sup => {
      if (!sup.createdAtDate) return false
      const date = new Date(sup.createdAtDate)
      return date.getMonth() === month && date.getFullYear() === year
    })
  

    // Clientes: agrupar por clientCode e somar sites ATIVOS no período
    const clientMap = new Map<string, { name: string, totalSites: number, topSupervisorName?: string, topZone?: string }>()
    companies.forEach(company => {
      // Sites desse cliente no período
      const clientSites = sites.filter((site: any) => site.clientCode === company.clientCode && site.createdAt && (() => {
        const d = new Date(site.createdAt)
        return d.getMonth() === month && d.getFullYear() === year
      })())
      if (clientSites.length === 0) return // Não mostra cliente sem site no período
      const totalSites = clientSites.length
      // Supervisor dominante
      const supervisorCount: Record<string, number> = {}
      clientSites.forEach((site: any) => {
        if (site.supervisorCode) {
          supervisorCount[site.supervisorCode] = (supervisorCount[site.supervisorCode] || 0) + 1
        }
      })
      let topSupervisor = ""
      let maxSup = 0
      for (const [sup, count] of Object.entries(supervisorCount)) {
        if (count > maxSup) {
          topSupervisor = sup
          maxSup = count
        }
      }
      // Mapear código para nome
      let topSupervisorName = ""
      if (topSupervisor) {
        const found = users.find((u: any) => u.employeeId === topSupervisor || u._id === topSupervisor)
        topSupervisorName = found ? found.name : topSupervisor
      }
      // Zona dominante
      const zoneCount: Record<string, number> = {}
      clientSites.forEach((site: any) => {
        if (site.zone) {
          zoneCount[site.zone] = (zoneCount[site.zone] || 0) + 1
        }
      })
      let topZone = ""
      let maxZone = 0
      for (const [zone, count] of Object.entries(zoneCount)) {
        if (count > maxZone) {
          topZone = zone
          maxZone = count
        }
      }
      clientMap.set(company.clientCode, {
        name: company.name,
        totalSites,
        topSupervisorName,
        topZone
      })
    })
    let clientes = Array.from(clientMap.values()).map(({ name, totalSites, topSupervisorName, topZone }) => ({
      name,
      value: totalSites,
      fill: "#2563eb",
      topSupervisorName,
      topZone,
      totalSites,
      fullName: name
    }))
    clientes = clientes.sort((a, b) => b.value - a.value)

    const totalSites = companies.reduce((sum, c) => sum + (c.sites || 0), 0)
    const sitesData = [ { name: "Total", value: totalSites, fill: "#60a5fa" } ]

    const supervisorMap = new Map<string, number>()
    filteredSupervisions.forEach(sup => {
      if (sup.supervisorName) {
        supervisorMap.set(sup.supervisorName, (supervisorMap.get(sup.supervisorName) || 0) + 1)
      }
    })
    let supervisores = Array.from(supervisorMap.entries()).map(([name, value]) => ({ name, value, fill: "#38bdf8" }))
    supervisores = supervisores.sort((a, b) => b.value - a.value).slice(0, 6)

    // Supervisão: contar por siteName nas supervisions filtradas
    const supervisionMap = new Map<string, { count: number, supervisorCount: Record<string, number> }>()
    filteredSupervisions.forEach(sup => {
      if (sup.siteName) {
        if (!supervisionMap.has(sup.siteName)) {
          supervisionMap.set(sup.siteName, { count: 0, supervisorCount: {} })
        }
        const entry = supervisionMap.get(sup.siteName)!
        entry.count++
        if (sup.supervisorName) {
          entry.supervisorCount[sup.supervisorName] = (entry.supervisorCount[sup.supervisorName] || 0) + 1
        }
      }
    })
    let supervisao = Array.from(supervisionMap.entries()).map(([name, obj]) => {
      // Descobrir supervisor mais frequente
      let topSupervisor = ""
      let maxCount = 0
      for (const [supName, count] of Object.entries(obj.supervisorCount)) {
        if (count > maxCount) {
          topSupervisor = supName
          maxCount = count
        }
      }
      let topSupervisorName = ""
      if (topSupervisor) {
        const found = users.find((u: any) => u.employeeId === topSupervisor || u._id === topSupervisor || u.name === topSupervisor)
        topSupervisorName = found ? found.name : topSupervisor
      }
      return { name, value: obj.count, fill: "#818cf8", topSupervisorName, fullName: name }
    })
    supervisao = supervisao.sort((a, b) => b.value - a.value)

    return { clientes, sites: sitesData, supervisores, supervisao }
  }, [loading, companies, sites, users, selectedMonth, selectedYear, supervisions, occurrences])

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const periodLabel = `${monthNames[Number.parseInt(selectedMonth)]} ${selectedYear}`

  const downloadExcel = () => {
    if (!data) return

    // Criar workbook
    const wb = XLSX.utils.book_new()

    // Helper para criar sheet com título estilizado e colunas organizadas
    function createSheetWithTitle(
      title: string,
      headers: string[],
      rows: (string | number)[][],
      colWidths: number[]
    ) {
      // Título na primeira linha
      const sheetData = [[title], [], headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(sheetData)
      // Mesclar o título
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]
      // Ajustar largura das colunas
      ws['!cols'] = colWidths.map((w: number) => ({ wch: w }))
      // Estilizar cabeçalho e título (apenas visual em apps que suportam)
      ws['A1'].s = { font: { bold: true, sz: 24 } } // Título maior e negrito
      headers.forEach((_: string, i: number) => {
        const col = String.fromCharCode(65 + i)
        const cell = ws[col + '3']
        if (cell) cell.s = { font: { bold: true } }
      })
      return ws
    }

    // Clientes
    const clientesHeaders = ["Nome", "Total de Sites", "Supervisor com mais sites", "Zona com mais sites"]
    const clientesRows = data.clientes.map((item) => [
      item.fullName || item.name,
      item.totalSites,
      item.topSupervisorName || "",
      item.topZone || ""
    ])
    const clientesColWidths = [30, 18, 28, 22]
    const clientesWs = createSheetWithTitle(
      "Analytics - Clientes",
      clientesHeaders,
      clientesRows,
      clientesColWidths
    )
    XLSX.utils.book_append_sheet(wb, clientesWs, "Clientes")

    // Download do arquivo
    const fileName = `analytics_${selectedMonth}_${selectedYear}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Controle de expansão incremental
  const clientesExpand = useExpandIncremental(data?.clientes.length || 0, 6, 4)
  const supervisaoExpand = useExpandIncremental(data?.supervisao.length || 0, 6, 4)

  return (
    <div className="container mx-auto  space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div onClick={downloadExcel}
          className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <FileSpreadsheet className="h-4 w-4 text-green-700" />
      Exportar para Excel
          </div>
        </div>
      </div>
      {/* Filtros */}
      <Card>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Ano:</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Mês:</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Período: {periodLabel}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
          </>
        ) : data ? (
          <>
            <div>
              <AnalyticsCard
                title="Clientes com Mais Sites"
                description={`Clientes com maior número de sites atrelados - ${periodLabel}`}
                data={data.clientes.slice(0, clientesExpand.showCount).map(item => ({ ...item, fill: '#FF8800' }))}
                type="clientes"
                maxBars={clientesExpand.showCount}
                renderBarLabel
                customTooltip={ClientTooltipContent}
              >
                {(data.clientes.length > 6) && (
                  <div className="flex justify-end gap-2 mt-2">
                    {clientesExpand.canExpand && (
                      <Button variant="ghost" size="sm" onClick={clientesExpand.expand}>
                        Mostrar mais
                      </Button>
                    )}
                    {clientesExpand.canCollapse && (
                      <Button variant="ghost" size="sm" onClick={clientesExpand.collapse}>
                        Colapsar
                      </Button>
                    )}
                  </div>
                )}
              </AnalyticsCard>
            </div>
            <div>
              <AnalyticsCard
                title="Supervisão por Site"
                description={`Quantidade de supervisões realizadas por site no período selecionado (${periodLabel})`}
                data={data.supervisao.slice(0, supervisaoExpand.showCount).map((item, idx, arr) => ({
                  ...item,
                  fill: idx === 0 && arr.length > 0 && item.value === Math.max(...arr.map(i => i.value)) ? '#22c55e' : '#FF8800',
                }))}
                type="supervisao"
                formatValue={(value) => `${value}%`}
                maxBars={supervisaoExpand.showCount}
                renderBarLabel
                customTooltip={SupervisionTooltipContent}
              >
                {(data.supervisao.length > 6) && (
                  <div className="flex justify-end gap-2 mt-2">
                    {supervisaoExpand.canExpand && (
                      <Button variant="ghost" size="sm" onClick={supervisaoExpand.expand}>
                        Mostrar mais
                      </Button>
                    )}
                    {supervisaoExpand.canCollapse && (
                      <Button variant="ghost" size="sm" onClick={supervisaoExpand.collapse}>
                        Colapsar
                      </Button>
                    )}
                  </div>
                )}
              </AnalyticsCard>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
