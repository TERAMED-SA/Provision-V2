"use client"
import type { Table } from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronDown, List, LayoutGrid, Plus, Search, Building, User, Filter, X, FilterX, Settings2 } from 'lucide-react'
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Checkbox } from "../ui/checkbox"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"

interface DataTableFiltersProps<TData> {
  table: Table<TData>
  filterOptions: {
    enableNameFilter?: boolean
    enableDateFilter?: boolean
    enableSiteFilter?: boolean
    enableSupervisorFilter?: boolean
    enableColumnVisibility?: boolean
    enableViewModeToggle?: boolean
    enableAddButton?: boolean
    enableColumnFilters?: boolean
    addButtonLabel?: string
  }
  onAddClick?: () => void
  searchTerm?: string
  setSearchTerm?: (value: string) => void
  date?: Date
  setDate?: (date: Date | undefined) => void
  viewMode?: "table" | "card"
  setViewMode?: (mode: "table" | "card") => void
}

export function DataTableFilters<TData>({
  table,
  filterOptions,
  onAddClick,
  searchTerm = "",
  setSearchTerm = () => {},
  date,
  setDate = () => {},
  viewMode = "table",
  setViewMode = () => {},
}: DataTableFiltersProps<TData>) {
  const [showColumnFilters, setShowColumnFilters] = useState(false)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  const {
    enableNameFilter = false,
    enableDateFilter = false,
    enableSiteFilter = false,
    enableSupervisorFilter = false,
    enableColumnVisibility = false,
    enableViewModeToggle = false,
    enableAddButton = false,
    enableColumnFilters = false,
    addButtonLabel = "Adicionar",
  } = filterOptions

  useEffect(() => {
    if (searchTerm) {
      table.setGlobalFilter(searchTerm)
    } else {
      table.resetGlobalFilter()
    }
  }, [table, searchTerm])

  const handleSiteFilter = (value: string) => {
    const column = table.getColumn("siteName")
    if (column) {
      column.setFilterValue(value)
    }
  }

  const handleSupervisorFilter = (value: string) => {
    const column = table.getColumn("supervisorName")
    if (column) {
      column.setFilterValue(value)
    }
  }

  const handleColumnFilter = (columnId: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }))

    const column = table.getColumn(columnId)
    if (column) {
      column.setFilterValue(value || undefined)
    }
  }

  const clearColumnFilters = () => {
    setColumnFilters({})
    table.getAllColumns().forEach((column) => {
      column.setFilterValue(undefined)
    })
  }

  const getColumnLabel = (columnId: string) => {
    const labels: Record<string, string> = {
      createdAtTime: "Hora",
      createdAt: "Data",
      siteName: "Site",
      supervisorName: "Supervisor",
      details: "Detalhes",
      priority: "Prioridade",
      name: "Nome",
      phoneNumber: "Telefone",
      email: "Email",
      active: "Estado",
      status: "Status",
      description: "Descrição",
      type: "Tipo",
      category: "Categoria",
    }
    return labels[columnId] || columnId.charAt(0).toUpperCase() + columnId.slice(1)
  }

  const filterableColumns = table
    .getAllColumns()
    .filter(
      (column) => column.getCanFilter() && column.id !== "actions" && column.id !== "select" && column.getIsVisible(),
    )

  const hasActiveColumnFilters = Object.values(columnFilters).some((value) => value.length > 0)
  const activeFiltersCount = Object.values(columnFilters).filter((value) => value.length > 0).length

  return (
    <div className="space-y-3">
      {/* Linha principal de filtros */}
      <div className="flex flex-wrap items-center justify-start gap-3">
        {/* Filtros básicos */}
        <div className="flex items-center gap-3">
          {/* Busca geral */}
          {enableNameFilter && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
              />
            </div>
          )}

          {/* Filtros específicos */}
          {enableSiteFilter && (
            <div className="relative min-w-[150px]">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Site..."
                value={(table.getColumn("siteName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => handleSiteFilter(event.target.value)}
                className="pl-10 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
              />
            </div>
          )}

          {enableSupervisorFilter && (
            <div className="relative min-w-[150px]">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Supervisor..."
                value={(table.getColumn("supervisorName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => handleSupervisorFilter(event.target.value)}
                className="pl-10 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
              />
            </div>
          )}

          {enableDateFilter && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9 min-w-[140px] justify-start text-left font-normal bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 ${!date ? "text-gray-500" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Data..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                {date && (
                  <div className="p-3 border-t flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                      Limpar
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Controles à direita */}
        <div className="flex items-center gap-2">
          {enableColumnFilters && (
            <Button
              variant={showColumnFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              className="h-9 relative"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}

          {enableColumnVisibility && viewMode === "table" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings2 className="h-4 w-4 mr-1" />
                  Colunas
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2">
                <div className="space-y-1">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
                        onClick={() => column.toggleVisibility(!column.getIsVisible())}
                      >
                        <Checkbox
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          tabIndex={-1}
                        />
                        <span className="text-sm">{getColumnLabel(column.id)}</span>
                      </div>
                    ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {enableViewModeToggle && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 w-8 p-0"
                title="Visualização em Tabela"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="h-8 w-8 p-0"
                title="Visualização em Cards"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          {enableAddButton && (
            <Button onClick={onAddClick} size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Filtros por coluna (expansível) */}
      {enableColumnFilters && showColumnFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Filtros por Coluna</h4>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveColumnFilters && (
                <Button
                  onClick={clearColumnFilters}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 hover:text-gray-700"
                >
                  <FilterX size={12} className="mr-1" />
                  Limpar
                </Button>
              )}
              <Button onClick={() => setShowColumnFilters(false)} variant="ghost" size="sm" className="h-7 w-7 p-0">
                <X size={12} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filterableColumns.map((column) => (
              <div key={column.id} className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  {getColumnLabel(column.id)}
                  {columnFilters[column.id] && <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={`Filtrar...`}
                    value={columnFilters[column.id] || ""}
                    onChange={(e) => handleColumnFilter(column.id, e.target.value)}
                    className="h-8 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  />
                  {columnFilters[column.id] && (
                    <Button
                      onClick={() => handleColumnFilter(column.id, "")}
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X size={10} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
