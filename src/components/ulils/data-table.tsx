"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Info } from "lucide-react"
import { DataTableFilters } from "./data-table-filters"
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  title?: string
  filterOptions: {
    enableNameFilter?: boolean
    enableDateFilter?: boolean
    enableSiteFilter?: boolean
    enableSupervisorFilter?: boolean
    enableColumnVisibility?: boolean
    enableViewModeToggle?: boolean
    enableAddButton?: boolean
    addButtonLabel?: string
  }
  onAddClick?: () => void
  searchTerm?: string
  setSearchTerm?: (value: string) => void
  date?: Date
  setDate?: (date: Date | undefined) => void
  viewMode?: "table" | "card"
  setViewMode?: (mode: "table" | "card") => void
  hasAvatar?: boolean
  avatarAccessor?: keyof TData
  nameAccessor?: keyof TData
  cardOptions?: {
    primaryField: keyof TData
    secondaryFields: Array<{
      key: keyof TData
      label: string
    }>
    onCardClick?: (item: TData) => void
  }
  emptyMessage?: string
  initialColumnVisibility?: VisibilityState
  onLoadMore?: () => void
  hasMore?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  title,
  filterOptions,
  onAddClick,
  searchTerm = "",
  setSearchTerm = () => {},
  date,
  setDate = () => {},
  viewMode = "table",
  setViewMode = () => {},
  hasAvatar = false,
  avatarAccessor = "logo" as keyof TData,
  nameAccessor = "name" as keyof TData,
  cardOptions,
  emptyMessage,
  initialColumnVisibility = {},
  onLoadMore,
  hasMore = false,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('DataTable')
  
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [rowSelection, setRowSelection] = React.useState({})
  const tableRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  })

  React.useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current || !onLoadMore || !hasMore || loading) return

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        onLoadMore()
      }
    }

    const currentRef = tableRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll)
      }
    }
  }, [onLoadMore, hasMore, loading])

  React.useEffect(() => {
    if (date && table.getColumn("createdAt")) {
      table.getColumn("createdAt")?.setFilterValue(date.toISOString().split("T")[0])
    } else if (table.getColumn("createdAt")) {
      table.getColumn("createdAt")?.setFilterValue(undefined)
    }
  }, [date, table])

  React.useEffect(() => {
    if (searchTerm && nameAccessor && table.getColumn(nameAccessor as string)) {
      table.getColumn(nameAccessor as string)?.setFilterValue(searchTerm)
    }
  }, [searchTerm, nameAccessor, table])



  const renderCardView = () => {
    if (!cardOptions) return null

    const paginatedData = table.getRowModel().rows.map((row) => row.original)

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {paginatedData.map((item, index) => (
          <Card
            key={index}
            className="group border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 bg-white dark:bg-gray-800"
            onClick={() => cardOptions.onCardClick && cardOptions.onCardClick(item)}
          >
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {String(item[cardOptions.primaryField] || "")}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 sm:space-y-3 flex  justify-between items-center">
                {cardOptions.secondaryFields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate mr-2">
                      {field.label}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-semibold truncate max-w-[60%] text-right">
                      {String(item[field.key] || "-")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderLoadingIndicator = () => (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="w-full">
      <Card className="border border-gray-300 rounded-sm dark:border-gray-700 shadow-none p-4 sm:p-6 md:p-8 dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-4 ">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ">
            <DataTableFilters
              table={table}
              filterOptions={filterOptions}
              onAddClick={onAddClick}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              date={date}
              setDate={setDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="relative h-[600px]">
            <div className="absolute inset-0 overflow-auto" ref={tableRef}>
              <div className="min-w-full">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-sm">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="py-3 sm:py-4 px-2 sm:px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wider first:pl-4 sm:first:pl-6 last:pr-4 sm:last:pr-6 whitespace-nowrap bg-gray-50 dark:bg-gray-800"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {loading && data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center">
                          {renderLoadingIndicator()}
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={`border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                            index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/30 dark:bg-gray-800/50"
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-2 sm:py-0.5 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-gray-100 first:pl-4 sm:first:pl-6 last:pr-4 sm:last:pr-6">
                              {cell.column.id === nameAccessor && hasAvatar ? (
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              ) : (
                                <div className="truncate">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 py-8">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                              <Info className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="text-base sm:text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                              {t('noDataFound')}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                              {emptyMessage || t('defaultEmptyMessage')}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {loading && data.length > 0 && renderLoadingIndicator()}
            </div>
          </div>
        ) : (
          <div className="relative h-[600px]">
            <div className="absolute inset-0 overflow-auto" ref={tableRef}>
              {loading && data.length === 0 ? renderLoadingIndicator() : renderCardView()}
              {loading && data.length > 0 && renderLoadingIndicator()}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}