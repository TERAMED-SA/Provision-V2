"use client";
import type { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronDown,
  List,
  LayoutGrid,
  Plus,
  Search,
  Building,
  User,
} from "lucide-react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Checkbox } from "../ui/checkbox";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface DataTableFiltersProps<TData> {
  table: Table<TData>;
  filterOptions: {
    enableNameFilter?: boolean;
    enableDateFilter?: boolean;
    enableSiteFilter?: boolean;
    enableSupervisorFilter?: boolean;
    enableColumnVisibility?: boolean;
    enableViewModeToggle?: boolean;
    enableAddButton?: boolean;
    addButtonLabel?: string;
  };
  onAddClick?: () => void;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  date?: Date;
  setDate?: (date: Date | undefined) => void;
  viewMode?: "table" | "card";
  setViewMode?: (mode: "table" | "card") => void;
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
  const t = useTranslations('DataTable.filters');
  
  const {
    enableNameFilter = false,
    enableDateFilter = false,
    enableSiteFilter = false,
    enableSupervisorFilter = false,
    enableColumnVisibility = false,
    enableViewModeToggle = false,
    enableAddButton = false,
    addButtonLabel = "Adicionar",
  } = filterOptions;

  useEffect(() => {
    if (searchTerm) {
      table.setGlobalFilter(searchTerm);
    } else {
      table.resetGlobalFilter();
    }
  }, [table, searchTerm]);

  const handleSiteFilter = (value: string) => {
    const column = table.getColumn("siteName");
    if (column) {
      column.setFilterValue(value);
    }
  };

  const handleSupervisorFilter = (value: string) => {
    const column = table.getColumn("supervisorName");
    if (column) {
      column.setFilterValue(value);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtro de nome/busca */}
      {enableNameFilter && (
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchByName')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* Filtro de site */}
      {enableSiteFilter && (
        <div className="relative w-full md:w-64">
          <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchBySite')}
            value={(table.getColumn("siteName")?.getFilterValue() as string) ?? ""}
            onChange={(event) => handleSiteFilter(event.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* Filtro de supervisor */}
      {enableSupervisorFilter && (
        <div className="relative w-full md:w-64">
          <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchBySupervisor')}
            value={(table.getColumn("supervisorName")?.getFilterValue() as string) ?? ""}
            onChange={(event) => handleSupervisorFilter(event.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* Filtro de data */}
      {enableDateFilter && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={
                `w-[240px] justify-start text-left font-normal${!date ? " text-muted-foreground" : ""}`
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date
                ? format(date, "PPP", { locale: ptBR })
                : t('filterByDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              locale={ptBR}
              footer={
                date && (
                  <div className="p-2 border-t flex justify-between">
                    <div>{format(date, "PPP", { locale: ptBR })}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDate(undefined)}
                    >
                      {t('clear')}
                    </Button>
                  </div>
                )
              }
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Alternador de modo de visualização */}
      {enableViewModeToggle && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
          title={t(`viewMode.${viewMode}`)}
        >
          {viewMode === "table" ? (
            <List className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Botão de adicionar */}
      {enableAddButton && (
        <Button
          variant="default"
          className="flex items-center gap-1"
          onClick={onAddClick}
        >
          <Plus className="h-4 w-4" />
          <span>{addButtonLabel}</span>
        </Button>
      )}

      {/* Visibilidade de colunas */}
      {enableColumnVisibility && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {t('columns')} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <div
                  key={column.id}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                  onClick={() => column.toggleVisibility()}
                >
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={() => column.toggleVisibility()}
                    tabIndex={-1}
                    aria-label={`Toggle ${column.id}`}
                  />
                  <span className="capitalize text-sm">
                    {column.id === "createdAtTime"
                      ? "Hora"
                      : column.id === "createdAt"
                      ? "Data"
                      : column.id === "siteName"
                      ? "Site"
                      : column.id === "supervisorName"
                      ? "Supervisor"
                      : column.id === "details"
                      ? "Detalhes"
                      : column.id === "priority"
                      ? "Prioridade"
                      : column.id === "name"
                      ? "Nome"
                      : column.id === "phoneNumber"
                      ? "Telefone"
                      : column.id === "email"
                      ? "Email"
                      : column.id === "active"
                      ? "Estado"
                      : column.id}
                  </span>
                </div>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}