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
import { ChevronLeft, ChevronRight, Filter, FileQuestion, GripVertical, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { DataTableFilters } from "./data-table-filters"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  description?: string
  filterOptions?: {
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
  handleViewDetails,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };

  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: viewMode === "card" ? 12 : 100,
  })
  const [isFiltering, setIsFiltering] = useState(false)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const [pageWindow, setPageWindow] = useState(0)
  const pageWindowSize = 3
  const MIN_COLUMN_WIDTH = 80;

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

  useEffect(() => {
    const currentPage = table.getState().pagination.pageIndex + 1
    if (currentPage - 1 < pageWindow * pageWindowSize) {
      setPageWindow(Math.floor((currentPage - 1) / pageWindowSize))
    } else if (currentPage - 1 >= (pageWindow + 1) * pageWindowSize) {
      setPageWindow(Math.floor((currentPage - 1) / pageWindowSize))
    }
  }, [table.getState().pagination.pageIndex, pageWindow, pageWindowSize])

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

  const getFixedColumnWidth = (columnId: string): number => {
    const lowerCaseColumnId = columnId.toLowerCase();
    
    const fixedWidths: Record<string, number> = {
      'createdat': 105,
      'actions': 100,
      'action': 100,
      'clientcode': 120,
      'details': 400,
      'codigo': 100,
      'site': 400,
      'name': 400, 
      'costcenter': 150,
      'email': 250,
 
    };

    for (const [key, width] of Object.entries(fixedWidths)) {
      if (lowerCaseColumnId.includes(key)) {
        return width;
      }
    }
    return 200;
  };

  const isFixedWidthColumn = (columnId: string): boolean => {
    const lowerCaseColumnId = columnId.toLowerCase();
    const fixedColumnPatterns = [
      'date', 'createdat', 'data', 'hora', 'time',  'actions', 'action' ,
      'clientcode', 'details', 'codigo', 'site', 'name', 'costcenter', 'email',
    ];
    
    return fixedColumnPatterns.some(pattern => lowerCaseColumnId.includes(pattern));
  };

  useEffect(() => {
    const initialWidths: Record<string, number> = {};
    table.getAllColumns().forEach(column => {
      initialWidths[column.id] = getFixedColumnWidth(column.id);
    });
    setColumnWidths(initialWidths);
  }, [table.getAllColumns().length]);

  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    if (isFixedWidthColumn(columnId)) {
      return;
    }
    
    e.preventDefault();
    setIsResizing(columnId);
    
    const startX = e.clientX;
    const startWidth = columnWidths[columnId] || getFixedColumnWidth(columnId);

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [columnId]: newWidth }));
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderPagination = () => {
    const totalPages = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1
    
    const startPage = pageWindow * pageWindowSize + 1
    const endPage = Math.min(startPage + pageWindowSize - 1, totalPages)

    const pageButtons = []
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "ghost"}
          size="icon"
          onClick={() => table.setPageIndex(i - 1)}
          className={`h-7 w-7 p-0 text-xs font-medium border-none ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          style={{ fontSize: "0.7rem" }}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={currentPage === 1}
          className="h-7 w-7 p-0 text-xs border-none"
          style={{ fontSize: "0.7rem" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {startPage > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPageWindow(pageWindow - 1);
                table.setPageIndex(startPage - pageWindowSize - 1);
              }}
              className="h-7 w-7 p-0 text-xs border-none"
              style={{ fontSize: "0.7rem" }}
            >
              ...
            </Button>
          </>
        )}
        {pageButtons}
        {endPage < totalPages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPageWindow(pageWindow + 1);
                table.setPageIndex(endPage);
              }}
              className="h-7 w-7 p-0 text-xs border-none"
              style={{ fontSize: "0.7rem" }}
            >
              ...
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.setPageIndex(totalPages - 1)}
              className="h-7 w-7 p-0 text-xs border-none"
              style={{ fontSize: "0.7rem" }}
            >
              {totalPages}
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={currentPage === totalPages}
          className="h-7 w-7 p-0 text-xs border-none"
          style={{ fontSize: "0.7rem" }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-6">
          {title && (
           <div className="flex items-center gap-2">
             <button onClick={handleBack} className="cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
           </div>
          )}
          {filterOptions.enableExportButton && (
          <div className="flex items-center">
            <DataTableFilters
              table={table}
              filterOptions={filterOptions}
              onAddClick={onAddClick}
              date={date}
              setDate={setDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        )}
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center">{renderPagination()}</div>
        )}
      </div>

      {data.length >= 2 && (
        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
          {table.getFilteredRowModel().rows.length === table.getPreFilteredRowModel().rows.length ? (
            <>Total de {table.getPreFilteredRowModel().rows.length} {title ? title : ''}</>
          ) : (
            <>Exibindo {table.getFilteredRowModel().rows.length} de {table.getPreFilteredRowModel().rows.length} {title ? title : ''}</>
          )}
        </div>
      )}

      {/* Container isolado para a tabela, para evitar quebra do layout externo */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto" style={{ width: '100%', maxWidth: '100vw' }}>
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id}>
              {/* Header das colunas */}
              <div className="flex bg-gray-50 dark:bg-gray-800/50">
                {headerGroup.headers.map((header, idx) => {
                  const columnWidth = columnWidths[header.id] || getFixedColumnWidth(header.id);
                  const isFixed = isFixedWidthColumn(header.id);
                  
                  return (
                    <div
                      key={header.id}
                      className="flex-shrink-0 py-1 px-4 text-sm font-medium text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 whitespace-nowrap relative"
                      style={{
                        width: `${columnWidth}px`,
                        minWidth: `${Math.max(MIN_COLUMN_WIDTH, columnWidth)}px`,
                        maxWidth: `${columnWidth}px`,
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {idx !== headerGroup.headers.length - 1 && !isFixed && (
                        <span
                          onMouseDown={e => handleMouseDown(e, header.id)}
                          className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10 hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center"
                          style={{ userSelect: 'none' }}
                        >
                          <GripVertical className="text-gray-400 hover:text-blue-600" size={12} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Linha dos filtros */}
              <div className="flex bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                {headerGroup.headers.map((header) => {
                  const columnWidth = columnWidths[header.id] || getFixedColumnWidth(header.id);
                  
                  return (
                    <div
                      key={header.id + '-filter'}
                      className="flex-shrink-0 py-1 px-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50"
                      style={{
                        width: `${columnWidth}px`,
                        minWidth: `${columnWidth}px`,
                        maxWidth: `${columnWidth}px`,
                      }}
                    >
                      {header.column.getCanFilter() ? (
                        <div className="flex items-center gap-1">
                          <Filter size={12} className="text-gray-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={String(header.column.getFilterValue() ?? '')}
                            onChange={e => header.column.setFilterValue(e.target.value)}
                            className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-gray-700 dark:text-gray-300 p-0 m-0"
                            style={{ boxShadow: 'none', borderRadius: 0 }}
                            placeholder="Filtrar..."
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="max-h-[640px] overflow-y-auto">
          {(loading || isFiltering) ? (
            <motion.div
              className="h-64 flex flex-col items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="h-8 w-8 md:h-12 md:w-12 text-gray-400 animate-spin" />
              </motion.div>
              <span className="text-sm md:text-base text-gray-500 dark:text-blue-300 ">Carregando dados...</span>
            </motion.div>
          ) : table.getRowModel().rows?.length ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row, index) => (
                <div
                  key={row.id}
                  className={`flex transition-colors hover:bg-blue-50/60 dark:hover:bg-gray-800/50 ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/30 dark:bg-gray-800/20"
                  }`}
                  onClick={() => handleViewDetails && handleViewDetails(row.original)}
                  style={{ cursor: handleViewDetails ? 'pointer' : 'default' }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnWidth = columnWidths[cell.column.id] || getFixedColumnWidth(cell.column.id);
                    const isRightAligned = ["createdAt", "createdAtTime", "updatedAt", "updatedAtTime"].includes(cell.column.id);
                    
                    return (
                      <div
                        key={cell.id}
                        className={`flex-shrink-0  px-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                          isRightAligned ? 'text-right' : 'text-left'
                        }`}
                        style={{
                          width: `${columnWidth}px`,
                          minWidth: `${columnWidth}px`,
                          maxWidth: `${columnWidth}px`,
                        }}
                        title={String(cell.getValue() ?? '')}
                      >
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={String(cell.getValue() ?? '')}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <FileQuestion className="h-4 w-4 text-gray-400" />
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}