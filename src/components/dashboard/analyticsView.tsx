"use client"

import { useCallback,  useState, useMemo } from "react"
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import {  Activity, Shield, AlertTriangle,  FileSpreadsheet } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Card, CardContent,  CardHeader } from "../ui/card"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { useTranslations } from "next-intl"
import { useSupervisionData } from "@/hooks/useDataQueries"
import { useSupervisionStore } from "@/hooks/useDataStore"
import * as XLSX from "xlsx"

interface ChartData {
  hour: string;
  day?: string;
  occurrences?: number;
  supervisions?: number;
}

interface BaseItem {
  createdAt: string;
  createdAtDate: Date;
  supervisorName?: string;
  name?: string;
}

function LoadingSkeleton() {
  return (
    <div className="h-[140px] w-full flex items-center justify-center">
      <div className="w-full">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-1/2 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <div className="flex h-[380px] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="">
          <div className="w-20 h-20 mx-auto lex items-center justify-center">
            <Icon className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-700">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function ModernChart({ data, loading, timeFilter }: { 
  data: ChartData[], 
  loading: boolean, 
  timeFilter: string
}) {
  const color = '#2563eb'
  const lightColor = '#dbeafe'

  if (loading) {
    return <LoadingSkeleton />
  }

  const maxValue = Math.max(...data.map(d => (d.supervisions ?? d.occurrences ?? 0)), 8)
  const yDomain = [0, Math.max(maxValue, 8)]

  const filteredData = data.filter((item) => (item.occurrences || item.supervisions || 0) > 0)

  if (filteredData.length === 0) {
    return (
      <EmptyState 
        icon={Activity}
        title="Nenhum dado registado"
        subtitle="Neste período selecionado"
      />
    )
  }

  const xAxisKey = (timeFilter === "month" || timeFilter === "week") ? "day" : "hour"

  return (
    <ChartContainer config={{}} className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8} />
              <stop offset="50%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            strokeOpacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={11}
            stroke="#64748b"
            angle={timeFilter === "month" ? -45 : 0}
            textAnchor={timeFilter === "month" ? "end" : "middle"}
            height={timeFilter === "month" ? 60 : 30}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          />
          <YAxis
            domain={yDomain}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={11}
            stroke="#64748b"
            tickFormatter={(value) => Number.isInteger(value) ? value.toString() : ''}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          />
          <ChartTooltip
            cursor={{ 
              stroke: color, 
              strokeWidth: 2, 
              strokeDasharray: '8 4',
              strokeOpacity: 0.6
            }}
            content={<ChartTooltipContent
              indicator="dot"
              labelStyle={{ 
                color: '#1e293b', 
                fontWeight: '600',
                fontSize: '13px'
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${lightColor}`,
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                padding: '16px 20px',
                backdropFilter: 'blur(10px)'
              }}
            />}
          />
          <Area
            dataKey={data[0]?.supervisions !== undefined ? "supervisions" : "occurrences"}
            type="monotone"
            fill="url(#gradient-blue)"
            stroke={color}
            strokeWidth={3}
            name="Total"
            animationDuration={900}
            animationEasing="ease-in-out"
            dot={{
              fill: color,
              strokeWidth: 2,
              r: 4,
              stroke: 'white',
            }}
            activeDot={{
              r: 7,
              stroke: color,
              strokeWidth: 3,
              fill: 'white',
              style: { cursor: 'pointer' }
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default function AnalyticsView() {
  const [occurrencesTimeFilter, setOccurrencesTimeFilter] = useState("day")
  const [supervisionsTimeFilter, setSupervisionsTimeFilter] = useState("day")
  const t = useTranslations('analytics')

  const { isLoading } = useSupervisionData()
  const { supervisions, occurrences } = useSupervisionStore()
  const rawOccurrences = useMemo(() => 
    occurrences.map(occ => ({
      createdAt: occ.createdAt,
      createdAtDate: occ.createdAtDate,
      name: occ.siteName
    })), [occurrences]
  )

  const rawSupervisions = useMemo(() => 
    supervisions.map(sup => ({
      createdAt: sup.createdAt,
      createdAtDate: sup.createdAtDate,
      supervisorName: sup.supervisorName,
      name: sup.siteName
    })), [supervisions]
  )

  const getDateRange = useCallback((timeFilter: string) => {
    const now = new Date()
    switch (timeFilter) {
      case "day":
        return { start: startOfDay(now), end: endOfDay(now) }
      case "yesterday":
        const yesterday = subDays(now, 1)
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
      case "week":
        return { start: startOfWeek(subDays(now, 6), { weekStartsOn: 1 }), end: endOfDay(now) }
      case "month":
        return { start: startOfMonth(now), end: endOfDay(now) }
      default:
        return { start: startOfDay(now), end: endOfDay(now) }
    }
  }, [])

  const processChartData = useCallback((data: BaseItem[], timeFilter: string): ChartData[] => {
    if (timeFilter === "month") {
      const daysInMonth: Record<string, number> = {}
      data.forEach((item) => {
        if (item.createdAtDate && !isNaN(item.createdAtDate.getTime())) {
          const day = format(item.createdAtDate, "dd/MM")
          daysInMonth[day] = (daysInMonth[day] || 0) + 1
        }
      })
      return Object.entries(daysInMonth)
        .sort(([a], [b]) => {
          const [da, ma] = a.split("/").map(Number)
          const [db, mb] = b.split("/").map(Number)
          return ma === mb ? da - db : ma - mb
        })
        .map(([day, count]) => ({
          day,
          hour: "",
          occurrences: count,
          supervisions: count,
        }))
    } else if (timeFilter === "week") {
      const daysOfWeek = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
      const weekGroups: Record<string, number> = {}
      daysOfWeek.forEach((d) => { weekGroups[d] = 0 })
      data.forEach((item) => {
        if (item.createdAtDate && !isNaN(item.createdAtDate.getTime())) {
          const dayIndex = item.createdAtDate.getDay()
          const weekDay = daysOfWeek[(dayIndex + 6) % 7]
          weekGroups[weekDay] = (weekGroups[weekDay] || 0) + 1
        }
      })
      return daysOfWeek.map((day) => ({
        day,
        hour: "",
        occurrences: weekGroups[day],
        supervisions: weekGroups[day],
      }))
    } else {
      const hourlyGroups: Record<string, number> = {}
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, "0")
        hourlyGroups[hour] = 0
      }

      data.forEach((item) => {
        if (item.createdAtDate && !isNaN(item.createdAtDate.getTime())) {
          const hour = format(item.createdAtDate, "HH")
          if (hour && hour.match(/^\d{2}$/)) {
            hourlyGroups[hour] = (hourlyGroups[hour] || 0) + 1
          }
        }
      })

      return Object.entries(hourlyGroups)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([hour, count]) => ({
          day: "",
          hour: `${hour}:00`,
          occurrences: count,
          supervisions: count,
        }))
    }
  }, [])

  const filteredOccurrences = useMemo(() => {
    if (!rawOccurrences.length) return []
    const { start, end } = getDateRange(occurrencesTimeFilter)
    return rawOccurrences.filter((item) => {
      try {
        return item.createdAtDate >= start && item.createdAtDate <= end
      } catch {
        return false
      }
    })
  }, [rawOccurrences, occurrencesTimeFilter, getDateRange])

  const filteredSupervisions = useMemo(() => {
    if (!rawSupervisions.length) return []
    const { start, end } = getDateRange(supervisionsTimeFilter)
    return rawSupervisions.filter((item) => {
      try {
        return item.createdAtDate >= start && item.createdAtDate <= end
      } catch {
        return false
      }
    })
  }, [rawSupervisions, supervisionsTimeFilter, getDateRange])

  const occurrencesChartData = useMemo(() => {
    return processChartData(filteredOccurrences, occurrencesTimeFilter)
  }, [filteredOccurrences, occurrencesTimeFilter, processChartData])

  const supervisionsChartData = useMemo(() => {
    return processChartData(filteredSupervisions, supervisionsTimeFilter)
  }, [filteredSupervisions, supervisionsTimeFilter, processChartData])

  const getPeriodTitle = useCallback((timeFilter: string) => {
    switch (timeFilter) {
      case "day":
        return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      case "yesterday":
        const yesterday = subDays(new Date(), 1)
        return format(yesterday, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      case "week":
        return `Últimos 7 dias`
      case "month":
        return format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })
      default:
        return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
  }, [])

  return (
    <div className="flex flex-col gap-8 p-1">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <Card className="bg-white shadow rounded-lg">
          <CardHeader className="pb-2">
            <div className="flex flex-row items-center justify-between gap-2 mb-1">
              <div className="flex flex-row items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-base font-semibold text-blue-700">
                  {t('supervisions.title', { default: 'Supervisões' })}
                </span>
              </div>

            </div>
            <span className="text-sm text-gray-500 mb-2">{getPeriodTitle(supervisionsTimeFilter)}</span>
            <FilterTabs
              value={supervisionsTimeFilter}
              onChange={setSupervisionsTimeFilter}
              data={rawSupervisions}
              timeFilter={supervisionsTimeFilter}
            />
          </CardHeader>
          <CardContent>
            <ModernChart 
              data={supervisionsChartData} 
              loading={isLoading} 
              timeFilter={supervisionsTimeFilter}
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow rounded-lg">
          <CardHeader className="pb-2">
            <div className="flex flex-row items-center justify-between gap-2 mb-1">
              <div className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="text-base font-semibold text-blue-700">
                  {t('occurrences.title', { default: 'Ocorrências' })}
                </span>
              </div>

            </div>
            <span className="text-sm text-gray-500 mb-2">{getPeriodTitle(occurrencesTimeFilter)}</span>
            <FilterTabs
              value={occurrencesTimeFilter}
              onChange={setOccurrencesTimeFilter}
              data={rawOccurrences}
              timeFilter={occurrencesTimeFilter}
            />
          </CardHeader>
          <CardContent>
            <ModernChart 
              data={occurrencesChartData} 
              loading={isLoading} 
              timeFilter={occurrencesTimeFilter}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FilterTabs({ value, onChange, data }: {
  value: string,
  onChange: (value: string) => void,
  data: BaseItem[],
  timeFilter: string,
}) {
  const t = useTranslations('analytics')

  const getDateRange = useCallback((filter: string) => {
    const now = new Date()
    switch (filter) {
      case "day":
        return { start: startOfDay(now), end: endOfDay(now) }
      case "yesterday":
        const yesterday = subDays(now, 1)
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
      case "week":
        return { start: startOfWeek(subDays(now, 6), { weekStartsOn: 1 }), end: endOfDay(now) }
      case "month":
        return { start: startOfMonth(now), end: endOfDay(now) }
      default:
        return { start: startOfDay(now), end: endOfDay(now) }
    }
  }, [])

  const getTotalForFilter = useCallback((filter: string) => {
    const { start, end } = getDateRange(filter)
    return data.filter((item) => {
      try {
        return item.createdAtDate >= start && item.createdAtDate <= end
      } catch {
        return false
      }
    }).length
  }, [data, getDateRange])

  const filters = [
    { key: 'day', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mês' },
  ]

  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-gray-50/80 p-0.5 rounded-xl border-0 shadow-sm gap-1">
        {filters.map((filter) => {
          const count = getTotalForFilter(filter.key)
          const isActive = value === filter.key
          return (
            <TabsTrigger
              key={filter.key}
              value={filter.key}
              className={`
                transition-all duration-200
                data-[state=active]:bg-blue-500
                data-[state=active]:text-white
                text-xs rounded-lg px-2 py-1
                border-0 hover:bg-blue-50
                flex flex-row items-center justify-center gap-1
                font-medium
                min-w-0
              `}
            >
              <span className="truncate">{filter.label}</span>
              <span
                className={`
                  ml-1  text-[11px] font-bold
                  ${isActive
                    ? " text-white"
                    : " text-blue-700"}
                  transition-all duration-200
                `}
                style={{ minWidth: 28, textAlign: "center" }}
              >
                {count}
              </span>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}