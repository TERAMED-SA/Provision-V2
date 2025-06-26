"use client"
import type { Table } from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronDown, List, LayoutGrid, Plus, Search, Building, User, Filter, X, FilterX, Settings2, Download } from 'lucide-react'
import * as XLSX from "xlsx"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Checkbox } from "../ui/checkbox"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

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
    enableExportButton?: boolean
    exportButtonLabel?: string
    exportFileName?: string
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
    enableExportButton = false,
    exportButtonLabel = "Exportar",
    exportFileName = "data.xlsx"
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

  const handleExport = () => {
    const headers = table
      .getVisibleLeafColumns()
      .filter(column => column.id !== "actions" && column.id !== "select")
      .map(column => getColumnHeader(column))

    const data = table.getFilteredRowModel().rows.map(row => {
      const dataRow: { [key: string]: any } = {}
      table
        .getVisibleLeafColumns()
        .filter(column => column.id !== "actions" && column.id !== "select")
        .forEach(column => {
          dataRow[getColumnHeader(column)] = row.getValue(column.id)
        })
      return dataRow
    })

    // Cria a planilha
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Ajusta largura das colunas para o conteúdo
    const cols = headers.map((header, colIdx) => {
      // Pega o maior tamanho do conteúdo da coluna
      const maxContentLength = Math.max(
        header.length,
        ...data.map(row => {
          const value = row[header]
          return value ? String(value).length : 0
        })
      )
      return { wch: maxContentLength + 2 } // +2 para espaçamento
    })
    worksheet["!cols"] = cols

    // Adiciona bordas horizontais e verticais em todas as células
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "")
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C })
        if (!worksheet[cell_address]) continue
        if (!worksheet[cell_address].s) worksheet[cell_address].s = {}
        worksheet[cell_address].s.border = {
          top:    { style: "thin", color: { rgb: "71717A" } },
          bottom: { style: "thin", color: { rgb: "71717A" } },
          left:   { style: "thin", color: { rgb: "71717A" } },
          right:  { style: "thin", color: { rgb: "71717A" } },
        }
      }
    }

    // Cria o workbook e exporta
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados")
    XLSX.writeFile(workbook, exportFileName, { cellStyles: true })
  }

  const clearColumnFilters = () => {
    setColumnFilters({})
    table.getAllColumns().forEach((column) => {
      column.setFilterValue(undefined)
    })
  }

  const getColumnHeader = (column: any) => {
    if (typeof column.columnDef.header === 'string') return column.columnDef.header
    if (typeof column.columnDef.header === 'function') {
      try {
        const header = column.columnDef.header({ column })
        if (typeof header === 'string') return header
        if (header && header.props && typeof header.props.children === 'string') return header.props.children
      } catch {}
    }
    return column.id.charAt(0).toUpperCase() + column.id.slice(1)
  }

  const filterableColumns = table
    .getAllColumns()
    .filter(
      (column) => column.getCanFilter() && column.id !== "actions" && column.id !== "select" && column.getIsVisible(),
    )
  const hasActiveColumnFilters = Object.values(columnFilters).some((value) => value.length > 0)
  const activeFiltersCount = Object.values(columnFilters).filter((value) => value.length > 0).length

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Linha principal de filtros */}
        <div className="flex flex-wrap items-center justify-start gap-3">
          {/* Filtros básicos */}
          <div className="flex items-center gap-3">
            {/* Busca geral */}
            {enableNameFilter && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-800 cursor-pointer" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-400 text-white text-sm">
                  <p>Buscar em todos os campos da tabela</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Filtros específicos */}
            {/* Filtro de Site como ícone popover */}
            {enableSiteFilter && (
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9 p-0 flex items-center justify-center cursor-pointer">
                        <Building className="h-5 w-5 text-gray-800 " />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-400 text-white text-sm">
                    <p>Filtrar por Site</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-56 p-3" align="start">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Filtrar por Site</span>
                    <Input
                      placeholder="Site..."
                      value={(table.getColumn("siteName")?.getFilterValue() as string) ?? ""}
                      onChange={(event) => handleSiteFilter(event.target.value)}
                      className="h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
                      autoFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Filtro de Supervisor como ícone popover */}
            {enableSupervisorFilter && (
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9 p-0 flex items-center justify-center cursor-pointer">
                        <User className="h-5 w-5 text-gray-800 cursor-pointer" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-400 text-white text-sm">
                    <p>Filtrar por Supervisor</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-56 p-3" align="start">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Filtrar por Supervisor</span>
                    <Input
                      placeholder="Supervisor..."
                      value={(table.getColumn("supervisorName")?.getFilterValue() as string) ?? ""}
                      onChange={(event) => handleSupervisorFilter(event.target.value)}
                      className="h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
                      autoFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Filtro de Data como ícone popover */}
            {enableDateFilter && (
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9 p-0 flex items-center justify-center cursor-pointer">
                        <CalendarIcon className="h-5 w-5 text-gray-800" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-400 text-white text-sm">
                    <p>Filtrar por Data</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex flex-col gap-2 p-3">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por Data</span>
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                    {date && (
                      <div className="pt-2 flex justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                              Limpar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-200 text-white text-sm">
                            <p>Remover filtro de data</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Controles à direita */}
          <div className="flex items-center gap-2">
            {enableColumnFilters && (
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent className="bg-gray-400 text-white text-sm">
                  <p>{showColumnFilters ? 'Ocultar' : 'Mostrar'} filtros avançados por coluna</p>
                </TooltipContent>
              </Tooltip>
            )}

            {enableColumnVisibility && viewMode === "table" && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Settings2 className="h-4 w-4 mr-1" />
                        Colunas
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-400 text-white text-sm">
                    <p>Mostrar/ocultar colunas da tabela</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-48 p-2">
                  <div className="space-y-1">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <Tooltip key={column.id}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
                              onClick={() => column.toggleVisibility(!column.getIsVisible())}
                            >
                              <Checkbox
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                tabIndex={-1}
                              />
                              <span className="text-sm">{getColumnHeader(column)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-400 text-white text-sm">
                            <p>{column.getIsVisible() ? 'Ocultar' : 'Mostrar'} coluna {getColumnHeader(column)}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {enableViewModeToggle && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-400 text-white text-sm">
                    <p>Visualização em Tabela</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "card" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                      className="h-8 w-8 p-0"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-400 text-white text-sm">
                    <p>Visualização em Cards</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {enableAddButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onAddClick} size="sm" className="h-9">
                    <Plus className="h-4 w-4 mr-1" />
                    {addButtonLabel}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-400 text-white text-sm">
                  <p>{addButtonLabel} novo item</p>
                </TooltipContent>
              </Tooltip>
            )}

            {enableExportButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleExport} size="sm" className="h-9" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    {exportButtonLabel}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-400 text-white text-sm">
                  <p>Exportar dados para Excel (.xlsx)</p>
                </TooltipContent>
              </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={clearColumnFilters}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-500 hover:text-gray-700"
                      >
                        <FilterX size={12} className="mr-1" />
                        Limpar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-400 text-white text-sm">
                      <p>Limpar todos os filtros de coluna</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setShowColumnFilters(false)} variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <X size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-400 text-white text-sm">
                    <p>Fechar filtros por coluna</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filterableColumns.map((column) => (
                <div key={column.id} className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    {getColumnHeader(column)}
                    {columnFilters[column.id] && <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />}
                  </label>
                  <div className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="text"
                          placeholder={`Filtrar...`}
                          value={columnFilters[column.id] || ""}
                          onChange={(e) => handleColumnFilter(column.id, e.target.value)}
                          className="h-8 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-400 text-white text-sm">
                        <p>Filtrar por {getColumnHeader(column)}</p>
                      </TooltipContent>
                    </Tooltip>
                    {columnFilters[column.id] && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleColumnFilter(column.id, "")}
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          >
                            <X size={10} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-400 text-white text-sm">
                          <p>Limpar filtro de {getColumnHeader(column)}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}