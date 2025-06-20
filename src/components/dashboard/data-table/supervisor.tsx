"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash, Eye, MapPin, MoreVertical, MoreHorizontal, MoreHorizontalIcon } from "lucide-react"
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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"

export function SupervisorTable() {
  const t = useTranslations("supervisors")
  const [data, setData] = React.useState<Supervisor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingSupervisor, setEditingSupervisor] = React.useState<Supervisor | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [sites, setSites] = React.useState<any[]>([])
  const [isSitesDialogOpen, setIsSitesDialogOpen] = React.useState(false)
  const [companyInfo, setCompanyInfo] = React.useState<any | null>(null)
  const [isCompanyInfoDialogOpen, setIsCompanyInfoDialogOpen] = React.useState(false)
  const [selectedSite, setSelectedSite] = React.useState<any | null>(null)
  const [selectedSupervisorId, setSelectedSupervisorId] = React.useState<string | null>(null)
  const [sitesLoading, setSitesLoading] = React.useState(false)
  const [sitePage, setSitePage] = React.useState(1)
  const [siteSearch, setSiteSearch] = React.useState("")
  const [selectedSupervisorName, setSelectedSupervisorName] = React.useState<string>("")
  const SITES_PER_PAGE = 7

  const handleAddClick = () => {
    setIsAddDialogOpen(true)
  }

  const fetchSupervisors = async () => {
    setLoading(true)
    try {
      const users = await userAdapter.getUsers()
      setData(users.map(user => ({
        _id: user._id,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        phoneNumber: user.phoneNumber,
        email: user.email,
        employeeId: user.employeeId,
        address: user.address,
        supervisorCode: "",
        taskId: null,
        time: "",
        costCenter: "",
        equipment: [],
        validation: false,
        idNotification: "",
        report: "",
        workersFound: 0,
        deletedAt: user.deletedAt ?? null,
      })))
    } finally {
      setLoading(false)
    }
  }

  const updateSupervisor = async (supervisor: Supervisor) => {
    setLoading(true)
    try {
      const userPayload = {
        name: supervisor.name,
        email: supervisor.email,
        address: supervisor.address,
        gender: (supervisor as any).gender && (supervisor as any).gender.trim() !== "" ? (supervisor as any).gender : "M",
        phoneNumber: supervisor.phoneNumber,
      };
      await userAdapter.updateUser(supervisor._id, userPayload)
      await fetchSupervisors()
      toast.success("Supervisor atualizado com sucesso")
    } catch (error: any) {
      const apiMsg = error?.response?.data?.message || error?.message || "Erro ao atualizar supervisor"
      toast.error(apiMsg)
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
      const user = await userAdapter.getUserById(supervisor._id)
      if (user) {
        setEditingSupervisor({
          _id: user._id,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          phoneNumber: user.phoneNumber,
          email: user.email,
          employeeId: user.employeeId,
          address: user.address,
          supervisorCode: "",
          taskId: null,
          time: "",
          costCenter: "",
          equipment: [],
          validation: false,
          idNotification: "",
          report: "",
          workersFound: 0,
          deletedAt: user.deletedAt ?? null,
        })
        setIsEditDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching supervisor for edit:", error)
    }
  }

  const handleViewSupervisor = async (supervisor: Supervisor) => {
    try {
      const user = await userAdapter.getUserById(supervisor._id)
      if (user) {
        const supervisorData = {
          _id: user._id,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          phoneNumber: user.phoneNumber,
          email: user.email,
          employeeId: user.employeeId,
          address: user.address,
          supervisorCode: "",
          taskId: null,
          time: "",
          costCenter: "",
          equipment: [],
          validation: false,
          idNotification: "",
          report: "",
          workersFound: 0,
          deletedAt: user.deletedAt ?? null,
        }
        window.dispatchEvent(new CustomEvent("view-supervisor-detail", { detail: supervisorData }))
      }
    } catch (error) {
      console.error("Error fetching supervisor details:", error)
    }
  }

  const handleFetchSupervisorSites = async (employeeId: string) => {
    const supervisor = data.find(s => s.employeeId === employeeId)
    setSelectedSupervisorName(supervisor ? supervisor.name : "")
    setIsSitesDialogOpen(true)
    setSitesLoading(true)
    setSites([])
    try {
      const sitesData = await userAdapter.getSupervisorSites(employeeId)
      setSites(sitesData || [])
    } catch (error) {
      toast.error("Erro ao buscar sites do supervisor")
      setSites([])
    } finally {
      setSitesLoading(false)
    }
  }

  const handleFetchCompanyInfo = async (costCenter: string) => {
    try {
      const info = await userAdapter.getCompanySiteInfo(costCenter)
      setCompanyInfo(info)
      setIsCompanyInfoDialogOpen(true)
    } catch (error) {
      toast.error("Erro ao buscar informações do site")
    }
  }

  React.useEffect(() => {
    fetchSupervisors()
  }, [])

  const filteredSites = sites.filter(site =>
    site.name?.toLowerCase().includes(siteSearch.toLowerCase()) ||
    site.costCenter?.toLowerCase().includes(siteSearch.toLowerCase())
  )
  const totalPages = Math.ceil(filteredSites.length / SITES_PER_PAGE)
  const paginatedSites = filteredSites.slice((sitePage - 1) * SITES_PER_PAGE, sitePage * SITES_PER_PAGE)


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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              title={t("view")}
              className="text-gray-600 hover:text-white hover:bg-black cursor-pointer"
              onClick={() => handleViewSupervisor(supervisor)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={t("edit")}
              className="text-gray-600 hover:text-white hover:bg-black cursor-pointer"
              onClick={() => handleEditSupervisor(supervisor)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Ver Sites"
              className="text-gray-600 hover:text-white hover:bg-black cursor-pointer"
              onClick={() => handleFetchSupervisorSites(supervisor.employeeId)}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title={t("delete")}
                  className="text-red-600 hover:text-white hover:bg-red-700 cursor-pointer"
                >
                  <Trash className="h-4 w-4" />
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
      
      <Dialog open={isSitesDialogOpen} onOpenChange={(open) => {
        setIsSitesDialogOpen(open)
        if (!open) { setSiteSearch(""); setSelectedSupervisorName(""); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle>Sites do Supervisor</DialogTitle>
              {selectedSupervisorName && (
                <span className="ml-4 mr-6 text-sm font-semibold text-primary whitespace-nowrap">{selectedSupervisorName}</span>
              )}
            </div>
          </DialogHeader>
          <div className="mb-3">
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Pesquisar por nome ou cost center..."
              value={siteSearch}
              onChange={e => { setSiteSearch(e.target.value); setSitePage(1); }}
            />
          </div>
          {sitesLoading ? (
            <div className="py-8 text-center">Carregando sites...</div>
          ) : paginatedSites.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">Nenhum site encontrado para este supervisor.</div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {paginatedSites.map(site => (
                <li key={site._id} className="flex items-center justify-between py-2 px-1 hover:bg-accent rounded transition">
                  <div>
                    <div className="font-semibold text-base">{site.name}</div>
                    <div className="text-xs text-muted-foreground">Cost Center: {site.costCenter}</div>
                  </div>
                  <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => {
                    setSelectedSite(site)
                    setIsSitesDialogOpen(false)
                    setIsCompanyInfoDialogOpen(true)
                  }}>
                    Visualizar
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && !sitesLoading && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" disabled={sitePage === 1} onClick={() => setSitePage(sitePage - 1)}>
                  Anterior
                </Button>
                <span className="self-center">Página {sitePage} de {totalPages}</span>
                <Button size="sm" variant="ghost" disabled={sitePage === totalPages} onClick={() => setSitePage(sitePage + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCompanyInfoDialogOpen} onOpenChange={(open) => {
        setIsCompanyInfoDialogOpen(open)
        if (!open) setIsSitesDialogOpen(true)
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Site</DialogTitle>
          </DialogHeader>
          {selectedSite ? (
            <div className="space-y-4 p-2">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-blue-500" size={22} />
                <span className="text-lg font-bold">{selectedSite.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded p-2"><span className="font-semibold">Cost Center:</span> {selectedSite.costCenter || "N/A"}</div>
                <div className="bg-gray-50 rounded p-2"><span className="font-semibold">Nº Trabalhadores:</span> {selectedSite.numberOfWorkers || "N/A"}</div>
                <div className="bg-gray-50 rounded p-2"><span className="font-semibold">Zona:</span> {selectedSite.zone || "N/A"}</div>
                <div className="bg-gray-50 rounded p-2"><span className="font-semibold">Criado em:</span> {selectedSite.createdAt ? new Date(selectedSite.createdAt).toLocaleDateString('pt-BR') : "-"}</div>
              </div>
            </div>
          ) : (
            <div>Carregando informações...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}