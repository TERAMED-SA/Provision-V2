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
import { ChevronLeft, ChevronRight, Filter, FileQuestion, GripVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
      'date': 30,
      'createdat': 30,
      'updatedat': 30,
      'createdat_time': 23,
      'updatedat_time': 23,
      'createdattime': 30,
      'updatedattime': 30,
      'data':30,
      'hora': 20,
      'time': 20,
      'timestamp': 20,
      'actions': 40,
      'action': 40,
      'clientcode': 30,
      'codigo': 30,
      'id': 80,
      'status': 120,
      'priority': 100,
      'prioridade': 100,
    };

    for (const [key, width] of Object.entries(fixedWidths)) {
      if (lowerCaseColumnId.includes(key)) {
        return width;
      }
    }
    return 150;
  };

  const isFixedWidthColumn = (columnId: string): boolean => {
    const lowerCaseColumnId = columnId.toLowerCase();
    const fixedColumnPatterns = [
      'date', 'createdat', 'updatedat', 'createdattime', 'updatedattime',
      'data', 'hora', 'time', 'timestamp', 'actions', 'action', 'acoes', 'acao'
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
      const newWidth = Math.max(50, startWidth + diff); // largura mínima de 50px
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
             <button onClick={handleBack} className=" cursor-pointer">
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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="relative">
          <div className="border border-gray-200 dark:border-gray-700 rounded-none overflow-hidden">
            <div className="w-full" ref={tableRef}>
              <Table className="bg-white dark:bg-gray-900" style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <>
                      <TableRow key={headerGroup.id} className="hover:bg-transparent">
                        {headerGroup.headers.map((header, idx) => {
                          const columnWidth = columnWidths[header.id] || getFixedColumnWidth(header.id);
                          const isFixed = isFixedWidthColumn(header.id);
                          
                          return (
                            <TableHead
                              key={header.id}
                              className="py-0 px-2 text-sm text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 whitespace-nowrap relative"
                              style={{
                                width: `${columnWidth}px`,
                                minWidth: `${Math.max(MIN_COLUMN_WIDTH, columnWidth)}px`,
                                maxWidth: `${columnWidth}px`,
                                cursor: isFixed ? 'default' : 'col-resize',
                              }}
                            >
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              {idx !== headerGroup.headers.length - 1 && !isFixed && (
                                <span
                                  onMouseDown={e => handleMouseDown(e, header.id)}
                                  className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10 hover:bg-blue-200 dark:hover:bg-blue-800"
                                  style={{ userSelect: 'none' }}
                                >
                                  <GripVertical className="mx-auto text-gray-400 hover:text-blue-600" size={12} />
                                </span>
                              )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                      <TableRow key={headerGroup.id + '-filter'} className="hover:bg-transparent">
                        {headerGroup.headers.map((header) => {
                          const columnWidth = columnWidths[header.id] || getFixedColumnWidth(header.id);
                          
                          return (
                            <TableHead
                              key={header.id + '-filter'}
                              className="py-0 px-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50"
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
                                    className="w-full bg-transparent border-none outline-none text-xs text-gray-700 dark:text-gray-300 p-0 m-0"
                                    style={{ boxShadow: 'none', borderRadius: 0 }}
                                    placeholder="Filtrar..."
                                  />
                                </div>
                              ) : null}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </>
                  ))}
                </TableHeader>
                <TableBody>
                  {(loading || isFiltering) ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="animate-pulse h-10">
                        {table.getAllColumns().map((column) => {
                          const columnWidth = columnWidths[column.id] || getFixedColumnWidth(column.id);
                          return (
                            <TableCell 
                              key={column.id} 
                              className="py-2 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 dark:bg-gray-800/50 whitespace-nowrap" 
                              style={{
                                width: `${columnWidth}px`,
                                minWidth: `${columnWidth}px`,
                                maxWidth: `${columnWidth}px`,
                              }}
                            >
                              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-gray-800/50 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/30 dark:bg-gray-800/20"}`}
                        onClick={() => handleViewDetails && handleViewDetails(row.original)}
                        style={{ cursor: handleViewDetails ? 'pointer' : 'default' }}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const columnWidth = columnWidths[cell.column.id] || getFixedColumnWidth(cell.column.id);
                          const isRightAligned = ["createdAt", "createdAtTime", "updatedAt", "updatedAtTime"].includes(cell.column.id);
                          
                          return (
                            <TableCell
                              key={cell.id}
                              className={`py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 dark:bg-gray-800/50 whitespace-nowrap ${isRightAligned ? 'text-right' : 'text-left'}`}
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
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-32 text-center py-8">
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
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}