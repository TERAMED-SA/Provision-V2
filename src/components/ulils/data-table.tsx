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
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, FileQuestion } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

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

  const renderPagination = () => {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageWindowSize = 3;
    const [pageWindow, setPageWindow] = useState(0);

    useEffect(() => {
      if (currentPage - 1 < pageWindow * pageWindowSize) {
        setPageWindow(Math.floor((currentPage - 1) / pageWindowSize));
      } else if (currentPage - 1 >= (pageWindow + 1) * pageWindowSize) {
        setPageWindow(Math.floor((currentPage - 1) / pageWindowSize));
      }
    }, [currentPage, pageWindowSize]);

    const startPage = pageWindow * pageWindowSize + 1;
    const endPage = Math.min(startPage + pageWindowSize - 1, totalPages);

    const pageButtons = [];
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {title && (
            <button onClick={handleBack} className="mr-2 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div>{table.getPageCount() > 1 && renderPagination()}</div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="relative overflow-x-auto">
          <div className="border border-gray-200 dark:border-gray-700 rounded-none overflow-hidden min-w-full">
            <div className=" w-full ">
              <Table className="bg-white dark:bg-gray-900">
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <>
                      <TableRow key={headerGroup.id} className="hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 whitespace-nowrap w-auto"
                          >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                      <TableRow key={headerGroup.id + '-filter'} className="hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id + '-filter'}
                            className="py-0 px-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 w-auto"
                          >
                            {header.column.getCanFilter() ? (
                              <div className="flex items-center gap-2">
                                <Filter size={12} className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={
                                    String(header.column.getFilterValue() ?? '')
                                  }
                                  onChange={e => header.column.setFilterValue(e.target.value)}
                                  className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 p-0 m-0"
                                  style={{ boxShadow: 'none', borderRadius: 0 }}
                                />
                              </div>
                            ) : null}
                          </TableHead>
                        ))}
                      </TableRow>
                    </>
                  ))}
                </TableHeader>
                <TableBody>
                  {(loading || isFiltering) ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="animate-pulse h-10">
                        {columns.map((_, colIndex) => (
                          <TableCell key={colIndex} className="py-2 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 dark:bg-gray-800/50 whitespace-nowrap w-auto">
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
                        className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-gray-800/50 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/30 dark:bg-gray-800/20"}`}
                        onClick={() => handleViewDetails && handleViewDetails(row.original)}
                        style={{ cursor: handleViewDetails ? 'pointer' : 'default' }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 dark:bg-gray-800/50 whitespace-nowrap w-auto"
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