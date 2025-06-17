"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown,  Edit, Trash, Eye } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "../../ulils/data-table"
import { SupervisorDetailModal } from "../supervisor/supervisor-Detail-Modal"
import { SupervisorAddForm } from "../supervisor/supervision-Add-Form"
import { SupervisorEditForm } from "../supervisor/supervision-edit"
import { BreadcrumbRoutas } from "../../ulils/breadcrumbRoutas"
import { useTranslations } from "next-intl"
import { Button } from "../../ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../ui/alert-dialog"
import { SupervisorFactory } from "@/features/application/infrastructure/factories/SupervisorFactory"
import { Supervisor } from "@/features/application/domain/entities/Supervisor"
import { GetSupervisorsUseCase } from "@/features/application/domain/use-cases/supervisor/GetSupervisorsUseCase"
import { UpdateSupervisorUseCase } from "@/features/application/domain/use-cases/supervisor/UpdateSupervisorUseCase"
import { DeleteSupervisorUseCase } from "@/features/application/domain/use-cases/supervisor/DeleteSupervisorUseCase"

export function SupervisorTable() {
  const t = useTranslations("supervisors")
  const [data, setData] = React.useState<Supervisor[]>([])
  const [supervisors, setSupervisors] = React.useState<Supervisor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingSupervisor, setEditingSupervisor] = React.useState<Supervisor | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const supervisorPort = SupervisorFactory.getSupervisorPort()
  const getSupervisorsUseCase = new GetSupervisorsUseCase(supervisorPort)
  const updateSupervisorUseCase = new UpdateSupervisorUseCase(supervisorPort)
  const deleteSupervisorUseCase = new DeleteSupervisorUseCase(supervisorPort)
 
  React.useEffect(() => {
    fetchSupervisors()
    
    const handleEditEvent = (event: Event) => {
      const supervisor = (event as CustomEvent).detail
      setEditingSupervisor(supervisor)
      setIsEditDialogOpen(true)
    }
    
    window.addEventListener('edit-supervisor', handleEditEvent as EventListener)
    
    return () => {
      window.removeEventListener('edit-supervisor', handleEditEvent as EventListener)
    }
  }, [])
  
  const fetchSupervisors = async () => {
    setLoading(true)
    try {
      const supervisors = await getSupervisorsUseCase.execute()
      setSupervisors(supervisors)
      setData(supervisors)
    } catch (error) {
      console.error("Erro ao buscar supervisores:", error)
      toast.error("Não foi possível carregar os supervisores")
    } finally {
      setLoading(false)
    }
  }
  
  const updateSupervisor = async (editedSupervisor: Supervisor) => {
    try {
      const { _id, active, ...payload } = editedSupervisor
      const updatedSupervisor = await updateSupervisorUseCase.execute(_id, payload)

      const updatedSupervisors = supervisors.map(sup => 
        sup._id === _id ? updatedSupervisor : sup
      );
      
      setSupervisors(updatedSupervisors);
      setData(updatedSupervisors);
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao atualizar supervisor:", error)
      return Promise.reject(error)
    }
  }

  const handleDelete = async (supervisorId: string) => {
    try {
      await deleteSupervisorUseCase.execute(supervisorId)
      const updatedSupervisors = supervisors.filter(sup => sup._id !== supervisorId)
      setSupervisors(updatedSupervisors)
      setData(updatedSupervisors)
      toast.success(t("deleteSuccess"))
    } catch (error) {
      console.error(t("deleteError"), error)
      toast.error(t("deleteError"))
      
    }
  }

  const handleAddClick = () => {
    setIsAddDialogOpen(true)
  }

  
 const columns: ColumnDef<Supervisor>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.name")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="font-medium">{user.name || t("noName")}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.phone")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("phoneNumber") || t("noPhone")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.email")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    id: "actions",
    header: t("table.actions"),
    cell: ({ row }) => {
      const supervisor = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-green-900 hover:bg-green-100 dark:hover:bg-green-900"
            onClick={() => window.dispatchEvent(new CustomEvent('view-supervisor-detail', { detail: supervisor }))}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">{t("view")}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900"
            onClick={() => window.dispatchEvent(new CustomEvent('edit-supervisor', { detail: supervisor }))}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">{t("edit")}</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-900 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">{t("delete")}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteConfirmDesc", { name: supervisor.name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("deleteCancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(supervisor._id)} className="bg-red-600 hover:bg-red-700">
                  {t("deleteConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]

  const handleAddSupervisor = () => {
    setIsAddDialogOpen(true);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1 md:col-span-2">
        <BreadcrumbRoutas />
      </div>
      <div className="col-span-1 md:col-span-2">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          title={t("title")}
          filterOptions={{
            enableNameFilter: true,
            enableColumnVisibility: true,
            enableAddButton: true,
            addButtonLabel: t("add"),
          }}
          onAddClick={handleAddClick}
          initialColumnVisibility={{
            email: false,
          }}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>
      <SupervisorEditForm
        supervisor={editingSupervisor}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={updateSupervisor}
      />
      <SupervisorAddForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchSupervisors} />
      <SupervisorDetailModal />
    </div>
  )
}