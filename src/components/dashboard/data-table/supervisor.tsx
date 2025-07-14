"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Edit,
  MapPin,
  Trash2,
  Loader2,
  Users,
  Building2,
  ArrowRightLeft,
  CheckCircle,
  ArrowLeft,
  Check,
} from "lucide-react"
import { DataTable } from "../../ulils/data-table"
import { SupervisorAddForm } from "../supervisor/supervision-Add-Form"
import { SupervisorEditForm } from "../supervisor/supervision-edit"
import { useTranslations } from "next-intl"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import toast from "react-hot-toast"

export function SupervisorTable() {
  const t = useTranslations("supervisors")
  const [data, setData] = React.useState<Supervisor[]>([])
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);
  const [loading, setLoading] = React.useState(true)
  const [editingSupervisor, setEditingSupervisor] = React.useState<Supervisor | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [sites, setSites] = React.useState<any[]>([])
  const [isSitesDialogOpen, setIsSitesDialogOpen] = React.useState(false)
  const [sitesLoading, setSitesLoading] = React.useState(false)
  const [siteSearch, setSiteSearch] = React.useState("")
  const [selectedSupervisorName, setSelectedSupervisorName] = React.useState<string>("")
  const [selectedSupervisor, setSelectedSupervisor] = React.useState<Supervisor | null>(null)
  const [isSupervisorDialogOpen, setIsSupervisorDialogOpen] = React.useState(false)
  const [isAssignMode, setIsAssignMode] = React.useState(false)
  const [selectedSiteForAssign, setSelectedSiteForAssign] = React.useState<any | null>(null)
  const [supervisorForAssign, setSupervisorForAssign] = React.useState<Supervisor | null>(null)
  const [supervisorSites, setSupervisorSites] = React.useState<any[]>([])
  const [supervisorSitesLoading, setSupervisorSitesLoading] = React.useState(false)
  const [assigningSite, setAssigningSite] = React.useState(false)
  const [showCount, setShowCount] = React.useState(5)

  const handleAddClick = () => {
    setIsAddDialogOpen(true)
  }

  const fetchSupervisors = async () => {
    setLoading(true)
    try {
      const users = await userAdapter.getUsers()
      setData(
        users.map((user) => ({
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
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  const updateSupervisor = async (supervisor: Supervisor) => {
    setLoading(true)
    try {
      const userPayload: any = {
        name: supervisor.name,
        email: supervisor.email,
        address: supervisor.address,
        phoneNumber: supervisor.phoneNumber,
      }
      if ((supervisor as any).gender && (supervisor as any).gender.trim() !== "") {
        userPayload.gender = (supervisor as any).gender
      }
      const result = await userAdapter.updateUser(supervisor._id, userPayload)
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
        setSelectedSupervisor({
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
        setIsSupervisorDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching supervisor details:", error)
    }
  }

  const handleFetchSupervisorSites = async (employeeId: string) => {
    const supervisor = data.find((s) => s.employeeId === employeeId)
    setSelectedSupervisorName(supervisor ? supervisor.name : "")
    setSelectedSupervisor(supervisor || null)
    setIsSitesDialogOpen(true)
    setSitesLoading(true)
    setSites([])
    setIsAssignMode(false)

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

  const handleAssignSite = (site: any) => {
    setSelectedSiteForAssign(site)
    setIsAssignMode(true)
    setSupervisorForAssign(null)
    setSupervisorSites([])
  }

  const handleSelectSupervisorForAssign = async (supervisor: Supervisor) => {
    setSupervisorForAssign(supervisor)
    setSupervisorSitesLoading(true)

    try {
      const sitesData = await userAdapter.getSupervisorSites(supervisor.employeeId)
      setSupervisorSites(sitesData || [])
    } catch (error) {
      toast.error("Erro ao buscar sites do supervisor")
      setSupervisorSites([])
    } finally {
      setSupervisorSitesLoading(false)
    }
  }

  const handleConfirmAssign = async () => {
    if (!selectedSiteForAssign || !supervisorForAssign) return
    setAssigningSite(true)
    try {
      const response = await userAdapter.assignSiteToSupervisor(
        supervisorForAssign.employeeId,
        selectedSiteForAssign.costCenter,
      )
      if (response?.status === 200) {
        toast.success(response?.message || "Site atribuído com sucesso!")
        setIsAssignMode(false)
        setSelectedSiteForAssign(null)
        setSupervisorForAssign(null)
        // Refresh site
        if (selectedSupervisor) {
          handleFetchSupervisorSites(selectedSupervisor.employeeId)
        }
      } else if (response?.status === 401 && response?.message) {
        toast.error(response.message)
      } else {
        toast.error("Erro ao atribuir site ao supervisor")
      }
    } catch (error: any) {
      const apiMsg = error?.response?.data?.message || error?.message || "Erro ao atribuir site ao supervisor"
      toast.error(apiMsg)
    } finally {
      setAssigningSite(false)
    }
  }

  React.useEffect(() => {
    fetchSupervisors()
  }, [])

  const filteredSites = sites.filter(
    (site) =>
      site.name?.toLowerCase().includes(siteSearch.toLowerCase()) ||
      site.costCenter?.toLowerCase().includes(siteSearch.toLowerCase()),
  )

  const columns: ColumnDef<Supervisor>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>{t("table.name")}</span>
      ),
      cell: ({ row }) => {
        const user = row.original
        return  <div className="font-medium">{user.name || t("noName")}</div>
       
        
      },
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>{t("table.phone")}</span>
      ),
      cell: ({ row }) => <div>{row.getValue("phoneNumber") || t("noPhone")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <span onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>{t("table.email")}</span>
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
            <span
              onClick={(e) => {
                e.stopPropagation()
                handleEditSupervisor(supervisor)
              }}
              className="p-0 hover:bg-blue-100"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                handleFetchSupervisorSites(supervisor.employeeId)
              }}
              className=" p-0 hover:bg-gray-100"
            >
              <MapPin className="h-4 w-4 text-gray-600" />
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <span
                  onClick={(e) => e.stopPropagation()}
                  className=" p-0 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </span>
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
        <DataTable
          columns={columns}
          data={sortedData}
          loading={loading}
          title={t("title")}
          filterOptions={{
            enableAddButton: true,
            addButtonLabel: t("add"),
            enableExportButton: true,
            exportButtonLabel: "Exportar Excel",
            exportFileName: "supervisores.xlsx",
          }}
          onAddClick={handleAddClick}
          handleViewDetails={handleViewSupervisor}
        />
      </div>

      <SupervisorEditForm
        supervisor={editingSupervisor}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={updateSupervisor}
      />

      <SupervisorAddForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchSupervisors} />

     <Dialog
      open={isSitesDialogOpen}
      onOpenChange={(open) => {
        setIsSitesDialogOpen(open)
        if (!open) {
          setSiteSearch("")
          setSelectedSupervisorName("")
          setIsAssignMode(false)
          setSelectedSiteForAssign(null)
          setSupervisorForAssign(null)
        }
      }}
    >
      <DialogContent className="max-w-7xl overflow-y-auto h-[75vh] flex items-center justify-center">
        <div className="flex h-full w-full">
          {/* Sites List Page */}
          {!isAssignMode && (
            <div className="flex flex-col w-full">
              {/* Header */}
              <div className="flex items-center gap-4 p-2 border-b bg-white">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{selectedSupervisor?.name?.charAt(0)?.toUpperCase() || "S"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedSupervisor?.name}</h2>
                  <p className="text-sm text-gray-500">Sites atribuídos</p>
                </div>
              </div>

              <div className="p-4">
                <Input
                  type="text"
                  placeholder="Pesquisar sites..."
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {sitesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Carregando sites...</span>
                    </div>
                  ) : filteredSites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <Building2 className="h-12 w-12 mb-2" />
                      <p>Nenhum site encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredSites.map((site) => (
                        <Card key={site._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2 text-sm">{site.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4 " />
                                    <span>{site.costCenter || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{site.numberOfWorkers || "0"}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignSite(site)}
                                className="cursor-pointer text-sm"
                              >
                                <ArrowRightLeft className="h-4 w-4 mr-1" />
                                Atribuir Site
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {isAssignMode && (
            <div className="flex flex-col w-full h-full">
              <div className=" border-b flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setIsAssignMode(false)} className="h-8 w-8 p-0 cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-semibold">Atribuir Site</h2>
              </div>

              <div className="p-4 border-b bg-gray-50">
                <p className=" text-gray-600">
                  Site: <span className="font-medium"> {selectedSiteForAssign?.name}</span>
                </p>
              </div>

              <div className="p-4 border-b flex flex-col">
                <h4 className="font-medium mb-3">Selecionar Supervisor</h4>
                <Input
                  type="text"
                  placeholder="Pesquisar supervisor..."
                  value={siteSearch}
                  onChange={(e) => setSiteSearch(e.target.value)}
                  className="mb-3 w-full"
                />
              </div>

              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {data
                    .filter(
                      (sup) =>
                        sup.name?.toLowerCase().includes(siteSearch.toLowerCase()) ||
                        sup.employeeId?.toLowerCase().includes(siteSearch.toLowerCase()),
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .slice(0, showCount)
                    .map((supervisor) => (
                      <div
                        key={supervisor.employeeId}
                        className={`flex items-center gap-3 p-1 rounded-lg cursor-pointer transition-all ${
                          supervisorForAssign?.employeeId === supervisor.employeeId
                            ? "bg-blue-100 border border-blue-500"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                        onClick={() => handleSelectSupervisorForAssign(supervisor)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{supervisor.name?.charAt(0)?.toUpperCase() || "S"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{supervisor.name}</p>
                          <p className="text-xs text-gray-500">{supervisor.employeeId}</p>
                        </div>
                        {supervisorForAssign?.employeeId === supervisor.employeeId && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    ))}
                  {data
                    .filter(
                      (sup) =>
                        sup.name?.toLowerCase().includes(siteSearch.toLowerCase()) ||
                        sup.employeeId?.toLowerCase().includes(siteSearch.toLowerCase()),
                    ).length > showCount && (
                    <div className="flex justify-center pt-2">
                      <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => setShowCount(showCount + 5)}>
                        Ver mais
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmAssign}
                    disabled={!supervisorForAssign || assigningSite}
                    className="flex-1 cursor-pointer"
                  >
                    {assigningSite ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Confirmar
                  </Button>
                  <Button variant="outline" onClick={() => setIsAssignMode(false)} className="flex-1 cursor-pointer">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

      <Dialog open={isSupervisorDialogOpen} onOpenChange={setIsSupervisorDialogOpen}>
        <DialogContent className="p-0 max-h-[95vh] flex flex-col w-full max-w-[95vw] lg:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 border-b p-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedSupervisor?.name?.charAt(0)?.toUpperCase() || "S"}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg font-bold text-primary">
                  {selectedSupervisor?.name || "N/A"}
                </DialogTitle>
                <p className="text-sm text-gray-500">ID do Funcionário: {selectedSupervisor?.employeeId || "N/A"}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-4 py-2 overflow-y-auto flex-grow bg-muted/10 dark:bg-muted/20">
            {selectedSupervisor ? (
              <div className="space-y-4 ">
                <Card className="rounded shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span> {selectedSupervisor.email || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {selectedSupervisor.phoneNumber || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Endereço:</span> {selectedSupervisor.address || "N/A"}
                    </div>
                  </CardContent>
                </Card>

                {selectedSupervisor.equipment && selectedSupervisor.equipment.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Equipamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedSupervisor.equipment.map((equip, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <div>
                              <span className="font-medium">Nome:</span> {equip.name || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Série:</span> {equip.serialNumber || "N/A"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <p>Nenhum dado encontrado.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
