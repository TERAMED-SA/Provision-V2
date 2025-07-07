"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Plus, Eye, Loader2, ChevronDown, Check } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import instance from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ulils/data-table";
import toast from "react-hot-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { userAdapter } from "@/features/application/infrastructure/factories/UserFactory";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface Site {
  _id: string
  name: string
  address?: string
  ctClient?: string
  clientCode: string
  costCenter: string
  numberOfWorkers: number
  supervisorCode: string
  zone: string
}

interface CompanyInfo {
  name: string
  address: string
  contactInfo: string
}

const siteSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(50, "Máximo 50 caracteres"),
  address: z.string().min(1, "Endereço obrigatório"),
  ctClient: z.string().optional(),
  costCenter: z.string().min(1, "Centro de custo obrigatório").max(13, "Máximo 13 caracteres"),
  numberOfWorkers: z.coerce.number().min(1, "Obrigatório").max(9999, "Máximo 9999"),
  supervisorCode: z.string().min(1, "Código obrigatório"),
  zone: z.string().min(1, "Zona obrigatória"),
});
type FormData = z.infer<typeof siteSchema>;

export default function CompanySites() {
  const t = useTranslations('companySites')
  const searchParams = useSearchParams()
  const clientCode = searchParams.get('clientCode')
  const companyName = searchParams.get('companyName')
  const [data, setData] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCompanyInfoModalOpen, setIsCompanyInfoModalOpen] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [supervisionCount, setSupervisionCount] = useState<number>(0)
  const [isSiteDetailModalOpen, setIsSiteDetailModalOpen] = useState(false)

  // Estados de loading para adicionar e editar
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(siteSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      address: "",
      ctClient: "",
      costCenter: "",
      numberOfWorkers: 0,
      supervisorCode: "",
      zone: "",
    },
  });

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [siteToDisable, setSiteToDisable] = useState<Site | null>(null);
  const [supervisors, setSupervisors] = useState<{ code: string; name: string }[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<{ code: string; name: string } | null>(null);
  useEffect(() => {
    if (isAddModalOpen) {
      reset({
        name: "",
        address: "",
        ctClient: "",
        costCenter: "",
        numberOfWorkers: 0,
        supervisorCode: "",
        zone: "",
      });
      setSelectedSupervisor(null);
    }
  }, [isAddModalOpen, reset]);

  const columns: ColumnDef<Site>[] = [
    {
      accessorKey: "costCenter",
      header: t('table.costCenter'),
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleOpenSiteDetail(row.original)}
        >
          {row.original.costCenter}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: t('table.name'),
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleOpenSiteDetail(row.original)}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "address",
      header: t('table.address'),
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleOpenSiteDetail(row.original)}
        >
          {row.original.address || "N/A"}
        </span>
      ),
    },

    {
      accessorKey: "numberOfWorkers",
      header: t('table.numberOfWorkers'),
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleOpenSiteDetail(row.original)}
        >
          {row.original.numberOfWorkers}
        </span>
      ),
    },
    {
      accessorKey: "supervisorCode",
      header: t('table.supervisorCode'),
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleOpenSiteDetail(row.original)}
        >
          {row.original.supervisorCode}
        </span>
      ),
    },
    {
      accessorKey: "zone",
      header: t('table.zone'),
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleOpenSiteDetail(row.original)}
        >
          {row.original.zone}
        </span>
      ),
    },
    {
      id: "actions",
      header: t('table.actions'),
      cell: ({ row }) => {
        const site = row.original
        return (
          <div className="flex gap-2">
            <span
              className="cursor-pointer"
              onClick={() => handleViewSupervisions(site)}
            >
            </span>
            <span
              className="cursor-pointer"
              onClick={() => handleEditClick(site)}
            >
              <Edit className="h-4 w-4" />
            </span>
            <span
              className="cursor-pointer text-red-600"
              onClick={() => {
                setSiteToDisable(site);
                setIsConfirmDialogOpen(true);
              }}
            >
              <Trash className="h-4 w-4" />
            </span>
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    const fetchSites = async () => {
      if (!clientCode) {
        toast.error(t('errors.clientCodeNotFound'))
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await instance.get(`/companySite?size=500`)
        const fetchedSites = response.data.data.data.filter((site: Site) => site.clientCode === clientCode)
        setData(fetchedSites)
      } catch (error) {
        console.error("Error fetching sites:", error)
        toast.error(t('errors.failedToLoadSites'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchSites()
  }, [clientCode, t])

  const fetchCompanyInfo = async (costCenter: string) => {
    try {
      const response = await instance.get(`/companySite/getCompanyInfo/${costCenter}`)
      setCompanyInfo(response.data.data)
    } catch (error) {
      console.error("Error fetching company info:", error)
      toast.error(t('errors.failedToLoadCompanyInfo'))
    }
  }

  const fetchSupervisionCount = async (supervisorCode: string) => {
    try {
      const response = await instance.get(`/companySite/getSuperivsorSites/${supervisorCode}?size=500`)
      setSupervisionCount(response.data.data.data.length || 0)
    } catch (error) {
      console.error("Error fetching supervision count:", error)
      toast.error(t('errors.failedToLoadSupervisions'))
    }
  }


  // Remove handleInputChange, handled by react-hook-form

  const onSubmitAdd = async (data: FormData) => {
    if (!clientCode) {
      toast.error(t('errors.clientCodeNotFound'));
      return;
    }
    setIsAdding(true);
    try {
      const response = await instance.post(`/companySite/create/${clientCode}/1162`, {
        ...data,
        location: {},
      });
      setData((prevList) => [...prevList, response.data.data]);
      toast.success(t('success.siteAdded'));
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding site:", error);
      toast.error(t('errors.failedToAddSite'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (site: Site) => {
    setSelectedSite(site);
    reset({
      name: site.name,
      address: site.address || "",
      ctClient: site.ctClient || "",
      costCenter: site.costCenter || "",
      numberOfWorkers: site.numberOfWorkers || 1,
      supervisorCode: site.supervisorCode || "",
      zone: site.zone || "",
    });
    setIsEditModalOpen(true);
  };

  const onSubmitEdit = async (data: FormData) => {
    if (!selectedSite || !clientCode) return;
    setIsUpdating(true);
    try {
      await instance.put(`/companySite/update/${selectedSite._id}/${clientCode}`, {
        ...data,
      });
      setData((prevList) =>
        prevList.map((site) =>
          site._id === selectedSite._id
            ? { ...site, ...data }
            : site,
        ),
      );
      toast.success(t('success.siteUpdated'));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error(t('errors.failedToUpdateSite'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisableSite = async (siteId: string) => {
    // Aqui você pode chamar a API para desabilitar ou deletar o site
    // Exemplo:
    // await instance.delete(`/companySite/disable/${siteId}`);
    // Atualize o estado dos sites conforme necessário
  };

  const handleViewSupervisions = async (site: Site) => {
    await fetchCompanyInfo(site.costCenter)
    await fetchSupervisionCount(site.supervisorCode)
    setSelectedSite(site)
    setIsCompanyInfoModalOpen(true)
  }

  const handleOpenSiteDetail = (site: Site) => {
    setSelectedSite(site)
    if (site.costCenter) {
      fetchCompanyInfo(site.costCenter)
    }
    if (site.supervisorCode) {
      fetchSupervisionCount(site.supervisorCode)
    }
    setIsSiteDetailModalOpen(true)
  }

  useEffect(() => {
    async function fetchSupervisors() {
      setLoadingSupervisors(true);
      try {
        const users = await userAdapter.getUsers();
        setSupervisors(
          users.map((user: any) => ({
            code: user.employeeId || user._id,
            name: user.name,
          }))
        );
      } catch (e) {
        setSupervisors([]);
      } finally {
        setLoadingSupervisors(false);
      }
    }
    fetchSupervisors();
  }, []);

  // Sincroniza supervisor selecionado ao editar
  useEffect(() => {
    if (isEditModalOpen && selectedSite && supervisors.length > 0) {
      const found = supervisors.find(sup => sup.code === selectedSite.supervisorCode);
      setSelectedSupervisor(found || null);
    }
  }, [isEditModalOpen, selectedSite, supervisors]);

  return (
    <div className="container p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">

        <div>
          <AlertDialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-black text-white cursor-pointer">
                <Plus className="h-4 w-4" />
                {t('buttons.addSite')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-7xl">
              <form onSubmit={handleSubmit(onSubmitAdd)}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base max-w-lg">
                    {t("modals.addSite.title") + " "}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {clientCode ? ` ${clientCode}` : ""}
                    {companyName ? `- ${companyName}` : ""}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4 min-h-96">
                  <div className="space-y-2 w-36">
                    <label htmlFor="costCenter">{t('fields.costCenter')}:</label>
                    <Input id="costCenter" maxLength={13} placeholder="Centro de custo" {...register("costCenter", {
                      required: 'Campo obrigatório',
                      minLength: { value: 1, message: 'Campo obrigatório' },
                      maxLength: { value: 13, message: 'Máximo 13 caracteres' },
                      pattern: { value: /^[A-Za-z0-9]+$/, message: 'Apenas letras e números' },
                    })} />
                    {errors.costCenter && <span className="text-xs text-red-500">{errors.costCenter.message as string}</span>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name">{t('fields.name')}:</label>
                    <Input
                      id="name"
                      placeholder="Nome"
                      maxLength={50}
                      onKeyDown={e => {
                        const input = e.target as HTMLInputElement;
                        if (input.value.length >= 50 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      {...register("name", {
                        required: 'Campo obrigatório',
                        minLength: { value: 1, message: 'Campo obrigatório' },
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      })}
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name.message as string}</span>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address">{t('fields.address')}:</label>
                    <Input id="address" placeholder="Endereço" {...register("address", {
                      required: 'Campo obrigatório',
                      minLength: { value: 1, message: 'Campo obrigatório' },
                    })} />
                    {errors.address && <span className="text-xs text-red-500">{errors.address.message as string}</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="space-y-2">
                      <label htmlFor="numberOfWorkers" className="block text-sm font-medium">
                        {t('fields.numberOfWorkers')}:
                      </label>
                      <Input
                        id="numberOfWorkers"
                        type="number"
                        min={0}
                        max={9999}
                        className="w-24"
                        placeholder="Nº de trabalhadores"
                        {...register("numberOfWorkers", {
                          valueAsNumber: true,
                          required: 'Campo obrigatório',
                          min: { value: 0, message: 'O valor mínimo é 0' },
                          max: { value: 9999, message: 'O valor máximo é 9999' },
                        })}
                      />
                      {errors.numberOfWorkers && (
                        <span className="text-xs text-red-500">
                          {errors.numberOfWorkers.message as string}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="zone" className="block text-sm font-medium">
                        {t('fields.zone')}
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-24 justify-between font-normal"
                            disabled={isAdding}
                          >
                            {watch("zone") ? watch("zone") : <span className="text-gray-400 ">{t('fields.zone')}</span>}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-24">
                          {["1", "2", "3", "4", "5", "6"].map(z => (
                            <DropdownMenuItem
                              key={z}
                              onClick={() => setValue("zone", z, { shouldValidate: true })}
                              className="font-normal"
                            >
                              {z}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {errors.zone && (
                        <span className="text-xs text-red-500">
                          {errors.zone.message as string}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="supervisorCode" className="block text-sm font-medium">
                        {t('fields.supervisorCode')}:
                      </label>
                      {(() => {
                        const [supervisorSearch, setSupervisorSearch] = useState("");
                        const [showAllSupervisors, setShowAllSupervisors] = useState(false);
                        const [dropdownOpen, setDropdownOpen] = useState(false);
                        const filteredSupervisors = supervisorSearch
                          ? supervisors.filter((sup) =>
                            sup.name && sup.name.toLowerCase().includes(supervisorSearch.toLowerCase())
                          )
                          : supervisors;
                        const visibleSupervisors = showAllSupervisors ? filteredSupervisors : filteredSupervisors.slice(0, 4);
                        return (
                          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                              <div className="w-full">
                                <Button
                                  variant="outline"
                                  className="w-full flex justify-between items-center font-normal"
                                  style={{ minWidth: 0 }}
                                  disabled={isAdding || loadingSupervisors}
                                >
                                  <span className="truncate text-left w-full">
                                    {supervisors.find(sup => sup.code === watch("supervisorCode"))?.name || <span className="text-gray-400">{t('fields.supervisorCode')}</span>}
                                  </span>
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full min-w-[220px] max-w-[350px] p-0">
                              <div className="p-2">
                                <Input
                                  placeholder="Pesquisar supervisor..."
                                  value={supervisorSearch}
                                  onChange={e => {
                                    setSupervisorSearch(e.target.value);
                                    setShowAllSupervisors(false);
                                  }}
                                  className="mb-2 h-7 text-sm ring-0 focus:ring-0 focus:outline-none focus:border-0"
                                />
                              </div>
                              {visibleSupervisors.length > 0 ? (
                                visibleSupervisors.map(sup => (
                                  <DropdownMenuItem
                                    key={sup.code}
                                    onClick={() => {
                                      setValue("supervisorCode", sup.code, { shouldValidate: true });
                                      setSupervisorSearch("");
                                      setShowAllSupervisors(false);
                                      setDropdownOpen(false);
                                    }}
                                    className="font-normal"
                                  >
                                    {sup.name}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <div className="text-center text-gray-400 py-2 text-sm select-none">Não encontrado</div>
                              )}
                              {!showAllSupervisors && filteredSupervisors.length > 4 && (
                                <DropdownMenuItem
                                  onClick={e => {
                                    e.preventDefault();
                                    setShowAllSupervisors(true);
                                    setTimeout(() => setDropdownOpen(true), 0);
                                  }}
                                  className="text-blue-600 font-semibold bg-gray-50 text-sm justify-center"
                                >
                                  Ver mais
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })()}
                      {errors.supervisorCode && (
                        <span className="text-xs text-red-500">
                          {errors.supervisorCode.message as string}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">{t('buttons.cancel')}</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <button type="submit" disabled={isAdding || !isValid} className="flex items-center">
                      {isAdding && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                      {t('buttons.add')}
                    </button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
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
            enableSiteFilter: true,
            enableColumnVisibility: true,
          }}
          initialColumnVisibility={{
            details: false,
          }}
        />

        {/* Edit Modal */}
        <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <AlertDialogContent className="max-w-md">
            <form onSubmit={handleSubmit(onSubmitEdit)}>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base max-w-lg">
                  Editar Site
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedSite?.name
                    ? ` ${selectedSite.name}`
                    : t("modals.editSite.title")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1  gap-4 items-start">
                  <div className="space-y-2 w-36">
                    <label htmlFor="edit-costCenter">{t('fields.costCenter')}:</label>
                    <Input
                      id="edit-costCenter"
                      maxLength={13}
                      placeholder="Centro de custo"
                      className={errors.costCenter ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                      {...register("costCenter", {
                        required: 'Campo obrigatório',
                        minLength: { value: 1, message: 'Campo obrigatório' },
                        maxLength: { value: 13, message: 'Máximo 13 caracteres' },
                        pattern: { value: /^[A-Za-z0-9]+$/, message: 'Apenas letras e números' },
                      })}
                    />
                    {errors.costCenter && <span className="text-xs text-red-500">{errors.costCenter.message as string}</span>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-name">{t('fields.name')}:</label>
                    <Input
                      id="edit-name"
                      maxLength={50}
                      placeholder="Nome"
                      className={errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                      onKeyDown={e => {
                        const input = e.target as HTMLInputElement;
                        if (input.value.length >= 50 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      {...register("name", {
                        required: 'Campo obrigatório',
                        minLength: { value: 1, message: 'Campo obrigatório' },
                        maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                      })}
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name.message as string}</span>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-address">{t('fields.address')}:</label>
                    <Input
                      id="edit-address"
                      placeholder="Endereço"
                      className={errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                      {...register("address", {
                        required: 'Campo obrigatório',
                        minLength: { value: 1, message: 'Campo obrigatório' },
                      })}
                    />
                    {errors.address && <span className="text-xs text-red-500">{errors.address.message as string}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mt-2">
                  <div className="space-y-2">
                    <label htmlFor="edit-numberOfWorkers" className="block text-sm font-medium">{t('fields.numberOfWorkers')}:</label>
                    <Input
                      id="edit-numberOfWorkers"
                      type="number"
                      min={1}
                      max={9999}
                      style={{ width: 80 }}
                      className={errors.numberOfWorkers ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                      placeholder="Nº de trabalhadores"
                      {...register("numberOfWorkers", {
                        valueAsNumber: true,
                        required: 'Campo obrigatório',
                        min: { value: 1, message: 'O valor mínimo é 1' },
                        max: { value: 9999, message: 'O valor máximo é 9999' },
                      })}
                    />
                    {errors.numberOfWorkers && <span className="text-xs text-red-500">{errors.numberOfWorkers.message as string}</span>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-zone" className="block text-sm font-medium">{t('fields.zone')}</label>
                    <Select
                      value={watch("zone")}
                      onValueChange={v => setValue("zone", v, { shouldValidate: true })}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className={`w-24 justify-between font-normal ${errors.zone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                        <SelectValue placeholder={t('fields.zone')} />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5", "6"].map(z => (
                          <SelectItem key={z} value={z}>{z}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.zone && <span className="text-xs text-red-500">{errors.zone.message as string}</span>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-supervisorCode" className="block text-sm font-medium">{t('fields.supervisorCode')}:</label>
                    <Select
                      value={watch("supervisorCode")}
                      onValueChange={v => setValue("supervisorCode", v, { shouldValidate: true })}
                      disabled={isUpdating || loadingSupervisors}
                    >
                      <SelectTrigger className={`w-full ${errors.supervisorCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                        <SelectValue placeholder={t('fields.supervisorCode')} />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors.map(sup => (
                          <SelectItem key={sup.code} value={sup.code}>{sup.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.supervisorCode && <span className="text-xs text-red-500">{errors.supervisorCode.message as string}</span>}
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">{t('buttons.cancel')}</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button type="submit" disabled={isUpdating || !isValid} className="flex items-center">
                    {isUpdating && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    {t('buttons.save')}
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>


        {/* Modal de Detalhes do Site */}
        <Dialog
          open={isSiteDetailModalOpen}
          onOpenChange={setIsSiteDetailModalOpen}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                {selectedSite && (
                  <>
                    {selectedSite.clientCode || "N/A"} -

                  </>
                )}
                {companyInfo && (
                  <div className="flex flex-col">

                    <span className="text-gray-900 font-medium">
                      {companyInfo.name}
                    </span>
                  </div>
                )}
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
                      <div className="col-span-full flex flex-row items-center gap-2 w-full">
                        <span className="font-semibold text-gray-700 mr-2 whitespace-nowrap">
                          Nome do Site:
                        </span>
                        <span className="text-gray-900 truncate w-full">
                          {selectedSite.name || "N/A"}
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

      {/* Modal de confirmação para desabilitar site */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desabilitar Site</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desabilitar o site <b>{siteToDisable?.name}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (siteToDisable) {
                  handleDisableSite(siteToDisable._id);
                }
                setIsConfirmDialogOpen(false);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}