"use client"
import type { Table } from "@tanstack/react-table"
import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from "xlsx"

interface DataTableFiltersProps<TData> {
  table: Table<TData>
  filterOptions: {
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
  date?: Date
  setDate?: (date: Date | undefined) => void
  viewMode?: "table" | "card"
  setViewMode?: (mode: "table" | "card") => void
}

export function DataTableFilters<TData>({
  table,
  filterOptions,
  onAddClick,
}: DataTableFiltersProps<TData>) {
  const {
    enableExportButton = false,
    exportButtonLabel = "Exportar",
    exportFileName = "data.xlsx"
  } = filterOptions

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
      const maxContentLength = Math.max(
        header.length,
        ...data.map(row => {
          const value = row[header]
          return value ? String(value).length : 0
        })
      )
      return { wch: maxContentLength + 2 }
    })
    worksheet["!cols"] = cols

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

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados")
    XLSX.writeFile(workbook, exportFileName, { cellStyles: true })
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

  if (!enableExportButton && !filterOptions.enableAddButton) return null;

  return (
    <div className="flex items-center gap-2">
      {filterOptions.enableAddButton && onAddClick && (
        <button
          onClick={onAddClick}
          className="bg-black text-white px-4 py-2 rounded-md shadow text-xs cursor-pointer"
          type="button"
        >
          {filterOptions.addButtonLabel || 'Adicionar'}
        </button>
      )}
      {enableExportButton && (
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          type="button"
          title="Exportar para Excel"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-700" />
          {exportButtonLabel}
        </button>
      )}
    </div>
  )
}