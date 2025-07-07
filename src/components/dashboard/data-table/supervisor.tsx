"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MapPin, Trash2, Loader2, Plus } from "lucide-react";
import { DataTable } from "../../ulils/data-table";
import { SupervisorAddForm } from "../supervisor/supervision-Add-Form";
import { SupervisorEditForm } from "../supervisor/supervision-edit";
import { useTranslations } from "next-intl";
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
} from "../../ui/alert-dialog";
import type { Supervisor } from "@/features/application/domain/entities/Supervisor";
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function SupervisorTable() {
  const t = useTranslations("supervisors");
  const [data, setData] = React.useState<Supervisor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingSupervisor, setEditingSupervisor] =
    React.useState<Supervisor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [sites, setSites] = React.useState<any[]>([]);
  const [isSitesDialogOpen, setIsSitesDialogOpen] = React.useState(false);
  const [sitesLoading, setSitesLoading] = React.useState(false);
  const [siteSearch, setSiteSearch] = React.useState("");
  const [selectedSupervisorName, setSelectedSupervisorName] =
    React.useState<string>("");
  const [selectedSupervisor, setSelectedSupervisor] =
    React.useState<Supervisor | null>(null);
  const [isSupervisorDialogOpen, setIsSupervisorDialogOpen] =
    React.useState(false);
  const [selectedSite, setSelectedSite] = React.useState<any | null>(null);
  const [selectedSupervisorToAssign, setSelectedSupervisorToAssign] =
    React.useState<Supervisor | null>(null);
  const [assigningSite, setAssigningSite] = React.useState(false);

  const handleAddClick = () => {
    setIsAddDialogOpen(true);
  };

  const fetchSupervisors = async () => {
    setLoading(true);
    try {
      const users = await userAdapter.getUsers();
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
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSupervisor = async (supervisor: Supervisor) => {
    setLoading(true);
    try {
      const userPayload: any = {
        name: supervisor.name,
        email: supervisor.email,
        address: supervisor.address,
        phoneNumber: supervisor.phoneNumber,
      };
      if ((supervisor as any).gender && (supervisor as any).gender.trim() !== "") {
        userPayload.gender = (supervisor as any).gender;
      }
      await userAdapter.updateUser(supervisor._id, userPayload);
      await fetchSupervisors();
      toast.success("Supervisor atualizado com sucesso");
    } catch (error: any) {
      const apiMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar supervisor";
      toast.error(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await userAdapter.deleteUser(id);
      await fetchSupervisors();
      toast.success("Supervisor desabilitado com sucesso");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSupervisor = async (supervisor: Supervisor) => {
    try {
      const user = await userAdapter.getUserById(supervisor._id);
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
        });
        setIsEditDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching supervisor for edit:", error);
    }
  };

  const handleViewSupervisor = async (supervisor: Supervisor) => {
    try {
      const user = await userAdapter.getUserById(supervisor._id);
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
        });
        setIsSupervisorDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching supervisor details:", error);
    }
  };

  const handleFetchSupervisorSites = async (employeeId: string) => {
    const supervisor = data.find((s) => s.employeeId === employeeId);
    setSelectedSupervisorName(supervisor ? supervisor.name : "");
    setIsSitesDialogOpen(true);
    setSitesLoading(true);
    setSites([]);
    try {
      const sitesData = await userAdapter.getSupervisorSites(employeeId);
      setSites(sitesData || []);
    } catch (error) {
      toast.error("Erro ao buscar sites do supervisor");
      setSites([]);
    } finally {
      setSitesLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSupervisors();
  }, []);

  const filteredSites = sites.filter(
    (site) =>
      site.name?.toLowerCase().includes(siteSearch.toLowerCase()) ||
      site.costCenter?.toLowerCase().includes(siteSearch.toLowerCase())
  );

  const columns: ColumnDef<Supervisor>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.name")}
        </span>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="font-medium">{user.name || t("noName")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.phone")}
        </span>
      ),
      cell: ({ row }) => (
        <div>{row.getValue("phoneNumber") || t("noPhone")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.email")}
        </span>
      ),
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      id: "actions",
      header: t("table.actions"),
      cell: ({ row }) => {
        const supervisor = row.original;
        return (
          <div className="flex gap-2">
            <span
              title={t("edit")}
              onClick={(e) => {
                e.stopPropagation();
                handleEditSupervisor(supervisor);
              }}
             className=" hover:bg-blue-100 cursor-pointer rounded transition-colors"
            >
           <Edit className="h-3.5 w-3.5 text-blue-600" />
            </span>
            <span
              title="Ver Sites"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); 
                handleFetchSupervisorSites(supervisor.employeeId);
              }}
            >
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <span
                  title={t("delete")}
                  onClick={(e) => {
                    e.stopPropagation(); 
                  }}
                  className="rounded transition-colors text-red-600 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                </span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("disableConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("disableConfirmDesc", { name: supervisor.name })}
                  </AlertDialogDescription>
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
        );
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1 md:col-span-2">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          title={t("title")}
          filterOptions={{
            enableAddButton: true,
            addButtonLabel: t("add"),
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
      <SupervisorAddForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchSupervisors}
      />

      <Dialog
        open={isSitesDialogOpen}
        onOpenChange={(open) => {
          setIsSitesDialogOpen(open);
          if (!open) {
            setSiteSearch("");
            setSelectedSupervisorName("");
            setSelectedSite(null);
            setSelectedSupervisorToAssign(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle>Sites do Supervisor</DialogTitle>
              {selectedSupervisorName && (
                <span className="ml-4 mr-6 text-sm font-semibold text-primary whitespace-nowrap">
                  {selectedSupervisorName}
                </span>
              )}
            </div>
          </DialogHeader>
          <div className="mb-3">
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Pesquisar por nome ou centro de custo..."
              value={siteSearch}
              onChange={(e) => {
                setSiteSearch(e.target.value);
              }}
            />
          </div>
          {sitesLoading ? (
            <div className="py-8 text-center text-gray-500">
              Carregando sites...
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="py-4 text-center text-gray-400">
              Nenhum site encontrado para este supervisor.
            </div>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto px-1">
              {filteredSites.map((site) => (
                <li
                  key={site._id}
                  className={`bg-white border rounded p-3 cursor-pointer ${selectedSite && selectedSite._id === site._id ? 'border-blue-500' : ''}`}
                  onClick={() => setSelectedSite(site)}
                >
                  <div className="font-bold text-primary text-base mb-1 flex items-center gap-2">
                    {site.name}
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="font-semibold">Centro de Custo:</span>{' '}
                      {site.costCenter || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Nº Trabalhadores:</span>{' '}
                      {site.numberOfWorkers || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Zona:</span>{' '}
                      {site.zone || "N/A"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Selecionar Supervisor para atribuir site</label>
            <Select
              value={selectedSupervisorToAssign?.employeeId || ''}
              onValueChange={(value: string) => {
                const sup = data.find(s => s.employeeId === value);
                setSelectedSupervisorToAssign(sup || null);
              }}
            >
              <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                <SelectValue placeholder="Selecione um supervisor" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {data
                  .filter(sup =>
                    sup.name?.toLowerCase().includes(siteSearch.toLowerCase())
                  )
                  .map(sup => (
                    <SelectItem key={sup.employeeId} value={sup.employeeId}>
                      {sup.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="mt-4  bg-zinc-800 cursor-pointer text-white py-2 rounded disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={!selectedSite || !selectedSupervisorToAssign || assigningSite}
            onClick={async () => {
              if (!selectedSite || !selectedSupervisorToAssign) return;
              setAssigningSite(true);
              const selectedSiteDetails = sites.find(site => site._id === selectedSite._id);
              const costCenter = selectedSiteDetails?.costCenter;
              try {
                const response = await userAdapter.assignSiteToSupervisor(selectedSupervisorToAssign.employeeId, costCenter);
                if (response?.status === 200) {
                  toast.success(response?.message || 'Supervisor atribuído com sucesso!');
                  setSelectedSite(null);
                  setSelectedSupervisorToAssign(null);
                } else if (response?.status === 401 && response?.message) {
                  toast.error(response.message);
                } else {
                  toast.error('Erro ao atribuir site ao supervisor');
                }
              } catch (error: any) {
                const apiMsg = error?.response?.data?.message || error?.message || 'Erro ao atribuir site ao supervisor';
                toast.error(apiMsg);
              } finally {
                setAssigningSite(false);
              }
            }}
          >
            {assigningSite ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2 text-white" />
                Atribuindo...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1 text-white" />
                Atribuir site ao supervisor
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>

          <Dialog
        open={isSupervisorDialogOpen}
        onOpenChange={setIsSupervisorDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 border-b pb-3">
              <DialogTitle className="text-lg font-bold text-primary">
                <span className="text-base text-muted-foreground flex gap-2 items-center">
                  <span className="font-semibold text-gray-700">
                    {selectedSupervisor?.employeeId || "N/A"}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-lg font-semibold text-gray-700">
                    {selectedSupervisor?.name || "N/A"}
                  </span>
                </span>
              </DialogTitle>
            </div>
          </DialogHeader>
          {selectedSupervisor ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 ">
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Informações Básicas
                  </h4>
                  <div className="grid gap-1 text-sm">
                    <div>
                      <span className="font-medium">Email: </span>
                      {selectedSupervisor.email || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Telefone: </span>
                      {selectedSupervisor.phoneNumber || "N/A"}
                    </div>
                  </div>
                </div>
                {selectedSupervisor.equipment &&
                  selectedSupervisor.equipment.length > 0 && (
                    <div className="rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
                        Equipamentos
                      </h4>
                      <div className="space-y-3">
                        {selectedSupervisor.equipment.map((equip, index) => (
                          <div
                            key={index}
                            className="rounded p-3 text-sm bg-white dark:bg-gray-800"
                          >
                            <div>
                              <span className="font-medium">Nome: </span>
                              {equip.name || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">
                                Número de Série:{" "}
                              </span>
                              {equip.serialNumber || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Estado: </span>
                              {equip.state || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">
                                Centro de Custo:{" "}
                              </span>
                              {equip.costCenter || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Observações: </span>
                              {equip.obs || "N/A"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                {selectedSupervisor.report && (
                  <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900">
                    <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      Relatório
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedSupervisor.report}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p>Nenhum dado do supervisor encontrado.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
