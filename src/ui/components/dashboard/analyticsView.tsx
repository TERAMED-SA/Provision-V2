"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { format, startOfDay, endOfDay, subDays, startOfWeek,startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TrendingUp, Activity, Shield } from "lucide-react"
import { toast } from "sonner"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import instance from "@/src/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Skeleton } from "../ui/skeleton"
import { useTranslations } from "next-intl"

interface ChartData {
  hour: string;
  occurrences?: number;
  supervisions?: number;
}

interface BaseItem {
  createdAt: string;
  createdAtDate: Date;
  supervisorName?: string;
  name?: string;
}

function LoadingSpinner() {
  return (
    <div className="flex h-[350px] w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
    </div>
  )
}

function OccurrencesChart({ data, loading, timeFilter }: { data: ChartData[], loading: boolean, timeFilter: string }) {
  const chartConfig = {
    occurrences: {
      label: "Ocorrências",
      color: "#ef4444",
    },
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const filteredData = data.filter((item) => (item.occurrences || 0) > 0)

  if (filteredData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma ocorrência registrada</p>
          <p className="text-sm">neste período</p>
        </div>
      </div>
    )
  }

  const dataKey = (timeFilter === "month" || timeFilter === "week") ? "day" : "hour"

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          accessibilityLayer 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorOccurrences" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey={dataKey}
            tickLine={false} 
            tickMargin={10} 
            axisLine={false} 
            fontSize={12}
            stroke="#64748b"
            angle={timeFilter === "month" ? -45 : 0}
            textAnchor={timeFilter === "month" ? "end" : "middle"}
            height={timeFilter === "month" ? 60 : 30}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10} 
            fontSize={12}
            stroke="#64748b"
            tickFormatter={(value) => Number.isInteger(value) ? value : ''}
          />
          <ChartTooltip 
            cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }} 
            content={<ChartTooltipContent 
              indicator="dashed" 
              labelStyle={{ color: '#1e293b' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />} 
          />
          <Bar 
            dataKey="occurrences" 
            fill="url(#colorOccurrences)" 
            radius={[6, 6, 0, 0]} 
            name="Ocorrências"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
function SupervisionsChart({ data, loading, timeFilter }: { data: ChartData[], loading: boolean, timeFilter: string }) {
  const chartConfig = {
    supervisions: {
      label: "Supervisões",
      color: "#3b82f6",
    },
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const filteredData = data.filter((item) => (item.supervisions || 0) > 0)

  if (filteredData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma supervisão registrada</p>
          <p className="text-sm">neste período</p>
        </div>
      </div>
    )
  }

  const dataKey = (timeFilter === "month" || timeFilter === "week") ? "day" : "hour"

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full" style={{ cursor: "pointer" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorSupervisions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey={dataKey}
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
            fontSize={12}
            stroke="#64748b"
            angle={timeFilter === "month" ? -45 : 0}
            textAnchor={timeFilter === "month" ? "end" : "middle"}
            height={timeFilter === "month" ? 60 : 30}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10} 
            fontSize={12}
            stroke="#64748b"
            tickFormatter={(value) => Number.isInteger(value) ? value : ''}
          />
          <ChartTooltip 
            cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5', pointerEvents: 'auto' }} 
            content={<ChartTooltipContent 
              indicator="dot" 
              labelStyle={{ color: '#1e293b' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />} 
          />
          <Area
            dataKey="supervisions"
            type="monotone"
            fill="url(#colorSupervisions)"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Supervisões"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default function AnalyticsView() {
  const [occurrencesTimeFilter, setOccurrencesTimeFilter] = useState("day")
  const [supervisionsTimeFilter, setSupervisionsTimeFilter] = useState("day")
  const [occurrencesLoading, setOccurrencesLoading] = useState(true)
  const [supervisionsLoading, setSupervisionsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawOccurrences, setRawOccurrences] = useState<BaseItem[]>([])
  const [rawSupervisions, setRawSupervisions] = useState<BaseItem[]>([])
  const [lastFetchTime, setLastFetchTime] = useState<{ occurrences: number, supervisions: number }>({
    occurrences: 0,
    supervisions: 0
  })
 const t = useTranslations('analytics');
  
  const getDateRange = useCallback((timeFilter: string) => {
    const now = new Date()
    
    switch (timeFilter) {
      case "day":
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
      case "yesterday":
        const yesterday = subDays(now, 1)
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        }
      case "week":
        return {
          start: startOfWeek(subDays(now, 6), { weekStartsOn: 1 }),
          end: endOfDay(now)
        }
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfDay(now)
        }
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
    }
  }, [])

  const processItemDate = useCallback((item: any): BaseItem | null => {
    try {
      let createdAtDate: Date | null = null
      
      if (item.createdAt) {
        const dateString = item.createdAt.toString()
        createdAtDate = new Date(dateString)
        if (isNaN(createdAtDate.getTime())) {
          createdAtDate = new Date(dateString.replace(/\s/, 'T'))
          
          if (isNaN(createdAtDate.getTime())) {
            console.warn('Data inválida encontrada:', item.createdAt)
            return null
          }
        }
      } else {
        console.warn('Item sem data de criação:', item)
        return null
      }

      return {
        ...item,
        createdAtDate,
        supervisorName: item.supervisorName || "N/A",
        name: item.name || "N/A",
      }
    } catch (error) {
      console.warn('Erro ao processar item:', error, item)
      return null
    }
  }, [])

  const getDataSize = useCallback((timeFilter: string) => {
    switch (timeFilter) {
      case "day":
      case "yesterday":
        return 500 
      case "week":
        return 1000 
      case "month":
        return 2000 
      default:
        return 500
    }
  }, [])

  const fetchOccurrences = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    const CACHE_DURATION = 2 * 60 * 1000

    if (!forceRefresh && rawOccurrences.length > 0 && (now - lastFetchTime.occurrences) < CACHE_DURATION) {
      setOccurrencesLoading(false)
      return
    }

    try {
      setOccurrencesLoading(true)
      setError(null)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) 

      const response = await instance.get('/occurrence', {
        params: {
          size: 10000, 
          sort: 'createdAt',
          order: 'desc'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      if (response.data?.data?.data) {
        const processedData = response.data.data.data
          .map(processItemDate)
          .filter(Boolean) as BaseItem[]

        setRawOccurrences(processedData)
        setLastFetchTime(prev => ({ ...prev, occurrences: now }))
      } else {
        throw new Error('Formato de resposta inválido')
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Timeout na requisição de ocorrências")
      } else {
        console.error("Error fetching occurrences:", error)
        toast.error("Erro ao carregar ocorrências")
      }
      setError("Erro ao carregar ocorrências")
    } finally {
      setOccurrencesLoading(false)
    }
  }, [rawOccurrences.length, lastFetchTime.occurrences, processItemDate])

  const fetchSupervisions = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    const CACHE_DURATION = 2 * 60 * 1000 

    if (!forceRefresh && rawSupervisions.length > 0 && (now - lastFetchTime.supervisions) < CACHE_DURATION) {
      setSupervisionsLoading(false)
      return
    }

    try {
      setSupervisionsLoading(true)
      setError(null)
      const response = await instance.get('/supervision', {
        params: {
          size: 5000,
          sort: 'createdAt',
          order: 'desc'
        }
      })


      if (response.data?.data?.data) {
        const processedData = response.data.data.data
          .map(processItemDate)
          .filter(Boolean) as BaseItem[]

        setRawSupervisions(processedData)
        setLastFetchTime(prev => ({ ...prev, supervisions: now }))
      } else {
        throw new Error('Formato de resposta inválido')
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Timeout na requisição de supervisões")
      } else {
        console.error("Error fetching supervisions:", error)
        toast.error("Erro ao carregar supervisões")
      }
      setError("Erro ao carregar supervisões")
    } finally {
      setSupervisionsLoading(false)
    }
  }, [rawSupervisions.length, lastFetchTime.supervisions, processItemDate])

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
      return Object.entries(hourlyGroups).map(([hour, count]) => ({
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

  useEffect(() => {
    fetchOccurrences()
    fetchSupervisions()
  }, []) 


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
    <div className="flex flex-col gap-6 ">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="w-full shadow-sm rounded-sm border-0 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Activity className="h-5 w-5" />
                {t('occurrences.title')}
              </CardTitle>
              <CardDescription className="text-red-600/70">
                {getPeriodTitle(occurrencesTimeFilter)}
              </CardDescription>
            </div>
            <Tabs value={occurrencesTimeFilter} onValueChange={setOccurrencesTimeFilter}>
              <TabsList className="grid w-full grid-cols-4 bg-white/50">
                <TabsTrigger value="day" className="data-[state=active]:bg-red-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.today')}
                </TabsTrigger>
                <TabsTrigger value="yesterday" className="data-[state=active]:bg-red-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.yesterday')}
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-red-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.week')}
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-red-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.month')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pb-4">
            <OccurrencesChart data={occurrencesChartData} loading={occurrencesLoading} timeFilter={occurrencesTimeFilter} />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm ">
            <div className="flex gap-2 font-semibold leading-none text-red-700">
              {t('occurrences.total', { count: filteredOccurrences.length })}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-gray-700/70">
              {occurrencesTimeFilter === "month"
                ? t('occurrences.distributionDay')
                : t('occurrences.distributionHour')}
            </div>
          </CardFooter>
        </Card>

        <Card className="w-full shadow-sm rounded-sm border-0 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="h-5 w-5" />
                {t('supervisions.title')}
              </CardTitle>
              <CardDescription className="text-blue-600/70">
                {getPeriodTitle(supervisionsTimeFilter)}
              </CardDescription>
            </div>
            <Tabs value={supervisionsTimeFilter} onValueChange={setSupervisionsTimeFilter}>
              <TabsList className="grid w-full grid-cols-4 bg-white/50">
                <TabsTrigger value="day" className="data-[state=active]:bg-blue-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.today')}
                </TabsTrigger>
                <TabsTrigger value="yesterday" className="data-[state=active]:bg-blue-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.yesterday')}
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-blue-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.week')}
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-blue-500 text-xs rounded-4xl cursor-pointer data-[state=active]:text-white">
                  {t('timeFilters.month')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pb-4">
            <SupervisionsChart data={supervisionsChartData} loading={supervisionsLoading}  timeFilter={supervisionsTimeFilter}/>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm ">
            <div className="flex gap-2 font-semibold leading-none text-blue-700">
              {t('supervisions.total', { count: filteredSupervisions.length })}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-gray-700/70">
              {t('supervisions.distributionHour')}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}