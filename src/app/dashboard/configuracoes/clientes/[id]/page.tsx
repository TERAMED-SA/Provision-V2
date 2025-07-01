"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Plus, Eye, MapPin, Info } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import instance from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ulils/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Site {
  _id: string;
  name: string;
  address?: string;
  ctClient?: string;
  clientCode: string;
  costCenter: string;
  numberOfWorkers: number;
  supervisorCode: string;
  zone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface CompanyInfo {
  name: string;
  address: string;
  contactInfo: string;
  zone: string;
}

interface Supervisor {
  _id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
}

interface FormData {
  name: string;
  address: string;
  costCenter: string;
  numberOfWorkers: string;
  supervisorCode: string;
  zone: string;
}

interface Coordinator {
  id: string;
  name: string;
}
interface SimpleSupervisor {
  code: string;
  name: string;
}

const initialFormData: FormData = {
  name: "",
  address: "",
  costCenter: "",
  numberOfWorkers: "",
  supervisorCode: "",
  zone: "",
};

export default function CompanySites() {
  const t = useTranslations("companySites");
  const searchParams = useSearchParams();
  const clientCode = searchParams.get("clientCode");
  const companyName = searchParams.get("companyName");

  const [data, setData] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompanyInfoModalOpen, setIsCompanyInfoModalOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [supervisionCount, setSupervisionCount] = useState<number>(0);
  const [isSiteDetailModalOpen, setIsSiteDetailModalOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);
  const [siteCoordinates, setSiteCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [supervisorsByCoordinator, setSupervisorsByCoordinator] = useState<
    SimpleSupervisor[]
  >([]);
  const [currentCoordinator, setCurrentCoordinator] =
    useState<Coordinator | null>(null);

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const columns: ColumnDef<Site>[] = [
    {
      accessorKey: "costCenter",
      header: t("table.costCenter"),
      cell: ({ row }) => <span>{row.original.costCenter}</span>,
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
      size: 100,
    },
    {
      accessorKey: "name",
      header: t("table.name"),
      cell: ({ row }) => (
        <span className="cursor-pointer hover:text-blue-600 transition-colors">
          {row.original.name}
        </span>
      ),
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
      size: 80,
    },
    {
      accessorKey: "address",
      header: t("table.address"),
      cell: ({ row }) => <span>{row.original.address || "N/A"}</span>,
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string | undefined;
        return (cellValue || "").toLowerCase().includes(value.toLowerCase());
      },
      size: 100,
    },
    {
      accessorKey: "numberOfWorkers",
      header: t("table.numberOfWorkers"),
      cell: ({ row }) => <span>{row.original.numberOfWorkers}</span>,
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as number;
        return cellValue.toString().includes(value);
      },
      size: 60,
    },
    {
      accessorKey: "supervisorCode",
      header: t("table.supervisorCode"),
      cell: ({ row }) => <span>{row.original.supervisorCode}</span>,
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
      size: 100,
    },
    {
      accessorKey: "zone",
      header: t("table.zone"),
      cell: ({ row }) => <span>{row.original.zone}</span>,
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
      size: 60,
    },
    {
      id: "actions",
      header: t("table.actions"),
      cell: ({ row }) => {
        const site = row.original;
        return (
          <div className="flex gap-2">
            <span
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(site);
              }}
            >
              <Edit className="h-4 w-4" />
            </span>
            <span
              className="cursor-pointer text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSite(site._id);
              }}
            >
              <Trash className="h-4 w-4" />
            </span>
          </div>
        );
      },
      size: 80,
    },
  ];

  useEffect(() => {
    const fetchSites = async () => {
      if (!clientCode) {
        toast.error(t("errors.clientCodeNotFound"));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await instance.get(`/companySite?size=500`);
        const fetchedSites = response.data.data.data.filter(
          (site: Site) => site.clientCode === clientCode
        );
        setData(fetchedSites);
      } catch (error) {
        toast.error(t("errors.failedToLoadSites"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSites();
  }, [clientCode, t]);

  // Buscar supervisores
  const fetchSupervisors = async () => {
    try {
      const response = await instance.get(`/supervisors?size=500`);
      setSupervisors(response.data.data.data || []);
    } catch (error) {
      toast.error("Erro ao carregar supervisores");
    }
  };

  // Buscar coordenadas do site
  const fetchSiteCoordinates = async (siteId: string) => {
    try {
      const response = await instance.get(`/companySite/${siteId}/coordinates`);
      setSiteCoordinates(response.data.data.coordinates || null);
    } catch (error) {
      setSiteCoordinates(null);
    }
  };

  const fetchCompanyInfo = async (costCenter: string) => {
    try {
      const response = await instance.get(
        `/companySite/getCompanyInfo/${costCenter}`
      );
      setCompanyInfo(response.data.data);
    } catch (error) {
      toast.error(t("errors.failedToLoadCompanyInfo"));
    }
  };

  const fetchSupervisionCount = async (supervisorCode: string) => {
    try {
      const response = await instance.get(
        `/companySite/getSuperivsorSites/${supervisorCode}?size=500`
      );
      setSupervisionCount(response.data.data.data.length || 0);
    } catch (error) {
      toast.error(t("errors.failedToLoadSupervisions"));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSupervisorChange = (supervisorCode: string) => {
    const supervisor = supervisors.find((s) => s.code === supervisorCode);
    setSelectedSupervisor(supervisor || null);
    setFormData((prev) => ({
      ...prev,
      supervisorCode: supervisorCode,
    }));
  };

  const handleAddSite = async () => {
    if (!clientCode) {
      toast.error(t("errors.clientCodeNotFound"));
      return;
    }

    try {
      const response = await instance.post(
        `/companySite/create/${clientCode}/1162`,
        {
          name: formData.name,
          address: formData.address,
          location: siteCoordinates || {},
          costCenter: formData.costCenter,
          numberOfWorkers: parseInt(formData.numberOfWorkers),
          supervisorCode: formData.supervisorCode,
          zone: formData.zone,
        }
      );

      if (response.status === 201) {
        toast.success(t("success.siteAdded"));
        setIsAddModalOpen(false);
        // Reset form
        setFormData(initialFormData);
        setSelectedSupervisor(null);
        setSiteCoordinates(null);
        // Refresh data
        const refreshResponse = await instance.get(`/companySite?size=500`);
        const refreshedSites = refreshResponse.data.data.data.filter(
          (site: Site) => site.clientCode === clientCode
        );
        setData(refreshedSites);
      }
    } catch (error) {
      toast.error(t("errors.failedToAddSite"));
    }
  };

  const handleEditClick = (site: Site) => {
    setSelectedSite(site);
    setFormData({
      name: site.name,
      address: site.address || "",
      costCenter: site.costCenter,
      numberOfWorkers: site.numberOfWorkers.toString(),
      supervisorCode: site.supervisorCode,
      zone: site.zone,
    });

    // Buscar o supervisor selecionado
    const supervisor = supervisors.find((s) => s.code === site.supervisorCode);
    setSelectedSupervisor(supervisor || null);

    // Buscar coordenadas do site
    if (site._id) {
      fetchSiteCoordinates(site._id);
    }

    setIsEditModalOpen(true);
  };

  const handleUpdateSite = async () => {
    if (!selectedSite) return;

    try {
      const response = await instance.put(
        `/companySite/update/${selectedSite._id}`,
        {
          name: formData.name,
          address: formData.address,
          costCenter: formData.costCenter,
          numberOfWorkers: parseInt(formData.numberOfWorkers),
          supervisorCode: formData.supervisorCode,
          zone: formData.zone,
        }
      );

      if (response.status === 200) {
        toast.success(t("success.siteUpdated"));
        setIsEditModalOpen(false);
        // Refresh data
        const refreshResponse = await instance.get(`/companySite?size=500`);
        const refreshedSites = refreshResponse.data.data.data.filter(
          (site: Site) => site.clientCode === clientCode
        );
        setData(refreshedSites);
      }
    } catch (error) {
      toast.error(t("errors.failedToUpdateSite"));
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    // Implement delete logic here, probably with a confirmation dialog
    toast.info("Delete functionality not implemented yet.");
  };

  const handleOpenAddModal = () => {
    // Reset form data to initial state
    setFormData(initialFormData);
    setSelectedSupervisor(null);
    setSiteCoordinates(null);
    // Fetch supervisors
    fetchSupervisors();
    setIsAddModalOpen(true);
  };

  const handleOpenSiteDetail = (site: Site) => {
    setSelectedSite(site);
    if (site.costCenter) {
      fetchCompanyInfo(site.costCenter);
    }
    if (site.supervisorCode) {
      fetchSupervisionCount(site.supervisorCode);
    }
    setIsSiteDetailModalOpen(true);
  };

  // Gere as zonas únicas dos sites do cliente
  const zonasUnicas = Array.from(
    new Set(data.map((site) => site.zone).filter(Boolean))
  );

  // Quando selecionar zona, buscar o coordenador daquela zona e os supervisores desse coordenador
  useEffect(() => {
    const fetchCoordinatorAndSupervisors = async () => {
      if (formData.zone) {
        try {
          // Buscar coordenador da zona
          const coordRes = await instance.get(
            `/coordinator?zone=${formData.zone}`
          );
          const coordinator = coordRes.data.data;
          setCurrentCoordinator(coordinator);
          // Buscar supervisores do coordenador e zona
          if (coordinator && coordinator.id) {
            const supRes = await instance.get(
              `/supervisors?coordinatorId=${coordinator.id}&zone=${formData.zone}`
            );
            setSupervisorsByCoordinator(supRes.data.data || []);
          } else {
            setSupervisorsByCoordinator([]);
          }
        } catch (e) {
          setCurrentCoordinator(null);
          setSupervisorsByCoordinator([]);
        }
      } else {
        setCurrentCoordinator(null);
        setSupervisorsByCoordinator([]);
      }
    };
    fetchCoordinatorAndSupervisors();
  }, [formData.zone]);

  return (
    <div className="container p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <AlertDialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="bg-black text-white cursor-pointer"
                onClick={handleOpenAddModal}
              >
                <Plus className="h-4 w-4" />
                {t("buttons.addSite")}{" "}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-4xl">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("modals.addSite.title")}{" "}
                  {companyName ? `- ${companyName}` : ""}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("modals.addSite.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-96 overflow-y-auto">
                         <div className="space-y-2">
                  <label htmlFor="costCenter">{t("fields.costCenter")}:</label>
                  <Input
                    id="costCenter"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleInputChange}
                    placeholder={t("placeholders.costCenter")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name">{t("fields.name")}:</label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t("placeholders.name")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address">{t("fields.address")}:</label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t("placeholders.address")}
                  />
                </div>
       
                <div className="space-y-2">
                  <label htmlFor="numberOfWorkers">Tl:</label>
                  <Input
                    id="numberOfWorkers"
                    name="numberOfWorkers"
                    type="text"
                    value={formData.numberOfWorkers}
                    onChange={handleInputChange}
                    placeholder="Tl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="zone">{t("fields.zone")}:</label>
                  <Select
                    value={formData.zone}
                    onValueChange={(value) =>
                      setFormData((f) => ({ ...f, zone: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("placeholders.zone")} />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "5"].map((zona) => (
                        <SelectItem key={zona} value={zona}>
                          {zona}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Coordenador (apenas leitura, aparece se zona selecionada) */}
                {formData.zone && currentCoordinator && (
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="font-semibold text-gray-700">
                      Coordenador:
                    </label>
                    <span className="text-gray-900 font-medium">
                      {currentCoordinator.name}
                    </span>
                  </div>
                )}
                {/* Select de Supervisor (aparece se coordenador e zona selecionados) */}
                {formData.zone &&
                  currentCoordinator &&
                  supervisorsByCoordinator.length > 0 && (
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-700">
                        Supervisor:
                      </label>
                      <Select
                        value={formData.supervisorCode}
                        onValueChange={(value) =>
                          setFormData((f) => ({ ...f, supervisorCode: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisorsByCoordinator.map((sup) => (
                            <SelectItem key={sup.code} value={sup.code}>
                              {sup.code} - {sup.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                {/* Coordenadas do Site (aparece só se zona selecionada) */}
                {formData.zone && (
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Coordenadas do Site
                    </label>
                    {siteCoordinates ? (
                      <div className="space-y-1">
                        <span className="block text-xs text-gray-700">
                          Latitude:{" "}
                          <span className="text-gray-900 font-medium">
                            {siteCoordinates.latitude}
                          </span>
                        </span>
                        <span className="block text-xs text-gray-700">
                          Longitude:{" "}
                          <span className="text-gray-900 font-medium">
                            {siteCoordinates.longitude}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Coordenadas não disponíveis
                      </span>
                    )}
                  </div>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddSite}>
                  {t("buttons.add")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          filterOptions={{
            enableNameFilter: true,
            enableColumnVisibility: true,
            enableColumnFilters: true,
            enableExportButton: true,
            exportButtonLabel: "Exportar Sites",
            exportFileName: `sites-${companyName}.xlsx`,
          }}
          onAddClick={handleOpenAddModal}
          handleViewDetails={handleOpenSiteDetail}
        />

        {/* Edit Modal */}
        <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base max-w-lg">
                {selectedSite?.name
                  ? `Editar Site - ${selectedSite.name}`
                  : t("modals.editSite.title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("modals.editSite.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                <label htmlFor="edit-costCenter">
                  {t("fields.costCenter")}:
                </label>
                <Input
                  id="edit-costCenter"
                  name="costCenter"
                  value={formData.costCenter}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-name">{t("fields.name")}:</label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-address">{t("fields.address")}:</label>
                <Input
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
          
              <div className="space-y-2">
                <label htmlFor="edit-numberOfWorkers">
                  {t("fields.numberOfWorkers")}:
                </label>
                <Input
                  id="edit-numberOfWorkers"
                  name="numberOfWorkers"
                  type="text"
                  value={formData.numberOfWorkers}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-supervisorCode">
                  {t("fields.supervisorCode")}:
                </label>
                <Input
                  id="edit-supervisorCode"
                  name="supervisorCode"
                  value={formData.supervisorCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-zone">{t("fields.zone")}:</label>
                <Input
                  id="edit-zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateSite}>
                {t("buttons.save")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Site Detail Modal */}
        <Dialog
          open={isSiteDetailModalOpen}
          onOpenChange={setIsSiteDetailModalOpen}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {selectedSite
                  ? `Detalhes - ${selectedSite.name}`
                  : "Detalhes do Site"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {selectedSite && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          Centro de Custo
                        </span>
                        <span className="text-gray-900">
                          {selectedSite.costCenter || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          Nº de Trabalhadores
                        </span>
                        <span className="text-gray-900">
                          {selectedSite.numberOfWorkers ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          Zona
                        </span>
                        <span className="text-gray-900">
                          {selectedSite.zone || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          Código do Supervisor
                        </span>
                        <span className="text-gray-900">
                          {selectedSite.supervisorCode || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          Código do Cliente
                        </span>
                        <span className="text-gray-900">
                          {selectedSite.clientCode || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col sm:col-span-2">
                        {companyInfo && (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                              {t("fields.name")}:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {companyInfo.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {t("modals.companyInfo.totalSupervisions")}:
                      </span>
                      <span className="text-blue-600 font-semibold text-lg">
                        {supervisionCount}
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
