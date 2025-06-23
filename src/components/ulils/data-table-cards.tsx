"use client"

import type { Row } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, MapPin, User, Eye, Edit, Trash2, Building, Clock, AlertTriangle, Download, FileText } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DataTableCardsProps<TData> {
  rows: Row<TData>[]
  loading: boolean
  cardConfig: {
    titleField?: string
    subtitleField?: string
    descriptionField?: string
    statusField?: string
    priorityField?: string
    dateField?: string
    avatarField?: string
    type?: "supervision" | "occurrence" | "default"
  }
  onCardClick?: (row: Row<TData>) => void
}

export function DataTableCards<TData>({ rows, loading, cardConfig, onCardClick }: DataTableCardsProps<TData>) {
  const getFieldValue = (row: Row<TData>, field?: string) => {
    if (!field) return ""
    return (row.original as any)[field] || ""
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, string> = {
      Ativo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Inativo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      Pendente: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    }
    return variants[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getPriorityVariant = (priority: string) => {
    const variants: Record<string, string> = {
      Alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      ALTA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Média: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      MEDIA: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Baixa: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      BAIXA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Crítica: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      CRITICA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return variants[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      ALTA: "Alta",
      MEDIA: "Média", 
      BAIXA: "Baixa",
      CRITICA: "Crítica",
    }
    return labels[priority] || priority
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleDateString("pt-BR")
    } catch {
      return dateString
    }
  }

  const getCardIcon = () => {
    switch (cardConfig.type) {
      case "supervision":
        return <Building className="h-4 w-4" />
      case "occurrence":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCardActions = (row: Row<TData>) => {
    const baseActions = [
      {
        icon: <Eye className="mr-2 h-4 w-4" />,
        label: "Visualizar",
        onClick: () => onCardClick?.(row),
      },
    ]

    if (cardConfig.type === "supervision") {
      return [
        ...baseActions,
        {
          icon: <Download className="mr-2 h-4 w-4" />,
          label: "Baixar PDF",
          onClick: () => console.log("Download PDF supervision:", row.original),
        },
        {
          icon: <Edit className="mr-2 h-4 w-4" />,
          label: "Editar",
          onClick: () => console.log("Edit supervision:", row.original),
        },
      ]
    }

    if (cardConfig.type === "occurrence") {
      return [
        ...baseActions,
        {
          icon: <Download className="mr-2 h-4 w-4" />,
          label: "Baixar PDF",
          onClick: () => console.log("Download PDF occurrence:", row.original),
        },
        {
          icon: <AlertTriangle className="mr-2 h-4 w-4" />,
          label: "Marcar Crítica",
          onClick: () => console.log("Mark critical:", row.original),
        },
      ]
    }

    return [
      ...baseActions,
      {
        icon: <Edit className="mr-2 h-4 w-4" />,
        label: "Editar",
        onClick: () => console.log("Edit:", row.original),
      },
      {
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        label: "Excluir",
        onClick: () => console.log("Delete:", row.original),
        className: "text-red-600",
      },
    ]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  </div>
                </div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="flex gap-2 mt-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          {getCardIcon()}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum resultado encontrado</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Tente ajustar os filtros ou adicionar novos dados para ver os cards aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rows.map((row) => {
        const title = getFieldValue(row, cardConfig.titleField)
        const subtitle = getFieldValue(row, cardConfig.subtitleField)
        const description = getFieldValue(row, cardConfig.descriptionField)
        const status = getFieldValue(row, cardConfig.statusField)
        const priority = getFieldValue(row, cardConfig.priorityField)
        const date = getFieldValue(row, cardConfig.dateField)
        const avatarText = getFieldValue(row, cardConfig.avatarField)
        const siteName = getFieldValue(row, "siteName")
        const supervisorName = getFieldValue(row, "supervisorName")
        const costCenter = getFieldValue(row, "costCenter")
        const time = getFieldValue(row, "createdAtTime")

        const actions = getCardActions(row)

        return (
          <Card
            key={row.id}
            className="group hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            onClick={() => onCardClick?.(row)}
          >
            <CardContent className="p-4">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar com ícone específico */}
                  <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 text-sm font-medium flex-shrink-0">
                    {cardConfig.type === "supervision" ? (
                      <Building className="h-5 w-5" />
                    ) : cardConfig.type === "occurrence" ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      avatarText.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Título e Subtítulo */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {cardConfig.type === "supervision" ? `Supervisão ${costCenter}` : 
                       cardConfig.type === "occurrence" ? `Ocorrência #${row.index + 1}` : 
                       title}
                    </h3>
                    {subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {cardConfig.type === "supervision" || cardConfig.type === "occurrence" ? siteName : subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Menu de Ações */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {actions.map((action, index) => {
                      const extraProps = (action as any).className ? { className: (action as any).className } : {};
                      return (
                        <DropdownMenuItem
                          key={index}
                          onClick={action.onClick}
                          {...extraProps}
                        >
                          {action.icon}
                          {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Descrição */}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{description}</p>
              )}

              {/* Badges e Informações */}
              <div className="space-y-2">
                {/* Status e Prioridade */}
                <div className="flex items-center gap-2 flex-wrap">
                  {status && <Badge className={`text-xs ${getStatusVariant(status)}`}>{status}</Badge>}
                  {priority && (
                    <Badge className={`text-xs ${getPriorityVariant(priority)}`}>
                      {getPriorityLabel(priority)}
                    </Badge>
                  )}
                </div>

                {/* Data e Hora */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(date)}</span>
                    </div>
                  )}
                  {time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{time}</span>
                    </div>
                  )}
                </div>

                {/* Informações específicas do tipo */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {supervisorName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-20">{supervisorName}</span>
                      </div>
                    )}
                    {costCenter && cardConfig.type !== "supervision" && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate max-w-20">{costCenter}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
