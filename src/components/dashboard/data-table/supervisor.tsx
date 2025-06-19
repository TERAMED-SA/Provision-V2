"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash, Eye } from "lucide-react"
import { DataTable } from "../../ulils/data-table"
import { SupervisorDetailModal } from "../supervisor/supervisor-Detail-Modal"
import { SupervisorAddForm } from "../supervisor/supervision-Add-Form"
import { SupervisorEditForm } from "../supervisor/supervision-edit"
import { BreadcrumbRoutas } from "../../ulils/breadcrumbRoutas"
import { useTranslations } from "next-intl"
import { Button } from "../../ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog"
import type { Supervisor } from "@/features/application/domain/entities/Supervisor"
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory"
import { toast } from "sonner"

export function SupervisorTable() {
  const t = useTranslations("supervisors")
  const [data, setData] = React.useState<Supervisor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingSupervisor, setEditingSupervisor] = React.useState<Supervisor | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)

  const handleAddClick = () => {
    setIsAddDialogOpen(true)
  }

  const fetchSupervisors = async () => {
    setLoading(true)
    try {
      const users = await userAdapter.getUsers()
      setData(users)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserById = async (id: string) => {
    try {
      const user = await userAdapter.getUserById(id)
      return user
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      return null
    }
  }

  const updateSupervisor = async (supervisor: Supervisor) => {
    setLoading(true)
    try {
      await userAdapter.updateUser(supervisor._id, supervisor)
      await fetchSupervisors()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await userAdapter.deleteUser(id)
      await fetchSupervisors()
      toast.success("Supervisor desabilitado com sucesso")
    } finally {
      setLoading(false)
    }
  }

  const handleEditSupervisor = async (supervisor: Supervisor) => {
    try {
      const fullSupervisorData = await fetchUserById(supervisor._id)
      if (fullSupervisorData) {
        setEditingSupervisor(fullSupervisorData)
        setIsEditDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching supervisor for edit:", error)
    }
  }

  // Handle view supervisor details
  const handleViewSupervisor = async (supervisor: Supervisor) => {
    try {
      const fullSupervisorData = await fetchUserById(supervisor._id)
      if (fullSupervisorData) {
        window.dispatchEvent(new CustomEvent("view-supervisor-detail", { detail: fullSupervisorData }))
      }
    } catch (error) {
      console.error("Error fetching supervisor details:", error)
    }
  }

  React.useEffect(() => {
    fetchSupervisors()
  }, [])

  const columns: ColumnDef<Supervisor>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("table.phone")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("phoneNumber") || t("noPhone")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
           className="cursor-pointer text-gray-600 hover:text-gray-100 hover:bg-gray-800"
              onClick={() => handleViewSupervisor(supervisor)}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">{t("view")}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 cursor-pointer text-blue-600 hover:text-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900"
              onClick={() => handleEditSupervisor(supervisor)}
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
                  <AlertDialogTitle>{t("disableConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("disableConfirmDesc", { name: supervisor.name })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("disableCancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(supervisor._id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t("disableConfirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

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
