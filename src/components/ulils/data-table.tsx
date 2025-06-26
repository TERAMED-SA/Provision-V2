"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  type PaginationState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTableFilters } from "./data-table-filters"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  description?: string
  filterOptions?: {
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
  onRowClick?: (row: TData) => void
  loading?: boolean
  date?: Date
  setDate?: (date: Date | undefined) => void
  initialColumnVisibility?: Record<string, boolean>
  cardConfig?: {
    titleField?: string
    subtitleField?: string
    descriptionField?: string
    statusField?: string
    priorityField?: string
    dateField?: string
    avatarField?: string
  }
  handleViewDetails?: (data: any) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "",
  description,
  filterOptions = {},
  onAddClick,
  onRowClick,
  loading = false,
  date,
  setDate,
  initialColumnVisibility = {},
  cardConfig = {
    titleField: "name",
    subtitleField: "email",
    descriptionField: "description",
    statusField: "status",
    priorityField: "priority",
    dateField: "createdAt",
    avatarField: "name",
  },
  handleViewDetails,
}: DataTableProps<TData, TValue>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: viewMode === "card" ? 12 : 100,
  })
  const [isFiltering, setIsFiltering] = useState(false)
  const [columnWidths, setColumnWidths] = useState<number[]>([])
  const tableRef = useRef<HTMLTableElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      pagination,
      columnVisibility,
    },
  })

  // Controlar estado de filtragem
  useEffect(() => {
    setIsFiltering(true)
    const timer = setTimeout(() => {
      setIsFiltering(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, date])

  useEffect(() => {
    if (date) {
      table.getColumn("createdAt")?.setFilterValue(date);
    } else {
      table.getColumn("createdAt")?.setFilterValue(undefined);
    }
  }, [date]);

  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1
  const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
  const endItem = Math.min(startItem + table.getState().pagination.pageSize - 1, data.length)

  const renderPagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 sm:mt-6  dark:border-gray-700 pt-4">
  
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from(
            { length: Math.min(totalPages, typeof window !== "undefined" && window.innerWidth < 640 ? 2 : 4) },
            (_, i) => {
              const maxPages = typeof window !== "undefined" && window.innerWidth < 640 ? 5 : 7
              let pageNumber
              if (totalPages <= maxPages) {
                pageNumber = i + 1
              } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                pageNumber = totalPages - maxPages + 1 + i
              } else {
                pageNumber = currentPage - Math.floor(maxPages / 2) + i
              }
              if (pageNumber < 1 || pageNumber > totalPages) return null
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                  className={`h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs font-medium transition-all ${
                    currentPage === pageNumber
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {pageNumber}
                </Button>
              )
            },
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <DataTableFilters
            table={table}
            filterOptions={filterOptions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            date={date}
            setDate={setDate}
            onAddClick={onAddClick}
          />
        </div>
        <div className="relative overflow-x-auto">
          <div className="border border-gray-200 dark:border-gray-700 rounded-none overflow-hidden min-w-full">
            <div className="max-h-[800px] overflow-y-auto w-full">
              <Table className=" bg-white dark:bg-gray-900">
                <TableHeader className=" bg-gray-50 dark:bg-gray-800/50 h-0">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent ">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="py-0 px-3 text-sm  text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 whitespace-nowrap w-auto "
                         
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {(loading || isFiltering) ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="animate-pulse h-10">
                        {columns.map((_, colIndex) => (
                          <TableCell key={colIndex} className="py-2 px-3 text-sm whitespace-nowrap w-auto max-w-[300px]">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-gray-800/50  ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/30 dark:bg-gray-800/20"}`}
                        onClick={() => handleViewDetails && handleViewDetails(row.original)}
                        style={{ cursor: handleViewDetails ? 'pointer' : 'default' }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-0.5 px-3 text-sm whitespace-nowrap w-auto max-w-[300px] overflow-hidden text-ellipsis"
                            title={String(cell.getValue() ?? '')}
                          >
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={String(cell.getValue() ?? '')}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-32 text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Nenhum resultado encontrado
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Tente ajustar os filtros ou adicionar novos dados
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">{renderPagination()}</div>
      </div>
    </div>
  )
}