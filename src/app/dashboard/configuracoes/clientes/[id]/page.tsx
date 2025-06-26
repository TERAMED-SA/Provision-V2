"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash, Plus,  Eye, MapPin, Info } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import instance from "@/lib/api"
import { BreadcrumbRoutas } from "@/components/ulils/breadcrumbRoutas"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ulils/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GenericDetailModal } from "@/components/dashboard/generic-detail-modal"



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
  zone: string
}

interface SupervisionInfo {
  total: number
}

interface FormData {
  name: string
  address: string
  ctClient: string
  costCenter: string
  numberOfWorkers: string
  supervisorCode: string
  zone: string
}


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

  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    ctClient: "",
    costCenter: "",
    numberOfWorkers: "",
    supervisorCode: "",
    zone: "",
  })

  const columns: ColumnDef<Site>[] = [
    {
      accessorKey: "costCenter",
      header: t('table.costCenter'),
      cell: ({ row }) => (
        <span>{row.original.costCenter}</span>
      ),
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: "name",
      header: t('table.name'),
      cell: ({ row }) => (
        <span className="cursor-pointer hover:text-blue-600 transition-colors">
          {row.original.name}
        </span>
      ),
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: "address",
      header: t('table.address'),
      cell: ({ row }) => (
        <span>{row.original.address || "N/A"}</span>
      ),
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string | undefined
        return (cellValue || "").toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: "numberOfWorkers",
      header: t('table.numberOfWorkers'),
      cell: ({ row }) => (
        <span>{row.original.numberOfWorkers}</span>
      ),
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as number
        return cellValue.toString().includes(value)
      },
    },
    {
      accessorKey: "supervisorCode",
      header: t('table.supervisorCode'),
      cell: ({ row }) => (
        <span>{row.original.supervisorCode}</span>
      ),
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: "zone",
      header: t('table.zone'),
      cell: ({ row }) => (
        <span>{row.original.zone}</span>
      ),
      filterFn: (row, id, value: string) => {
        const cellValue = row.getValue(id) as string
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
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
              onClick={e => {
                e.stopPropagation();
                handleEditClick(site)
              }}
            >
              <Edit className="h-4 w-4" />
            </span>
            <span
              className="cursor-pointer text-red-600"
              onClick={e => {
                e.stopPropagation(); 
                handleDeleteSite(site._id)
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
        console.log("Fetched Sites:", fetchedSites)
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
      console.log("Company Info Response:", response.data)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSite = async () => {
    if (!clientCode) {
      toast.error(t('errors.clientCodeNotFound'))
      return
    }

    try {
      const response = await instance.post(`/companySite/create/${clientCode}/1162`, {
        name: formData.name,
        address: formData.address,
        location: {},
        ctClient: formData.ctClient,
        costCenter: formData.costCenter,
        numberOfWorkers: parseInt(formData.numberOfWorkers),
        supervisorCode: formData.supervisorCode,
        zone: formData.zone,
      })

      if (response.status === 201) {
        toast.success(t('success.siteAdded'))
        setIsAddModalOpen(false)
        // Refresh data
        const refreshResponse = await instance.get(`/companySite?size=500`)
        const refreshedSites = refreshResponse.data.data.data.filter((site: Site) => site.clientCode === clientCode)
        setData(refreshedSites)
      }
    } catch (error) {
      console.error("Error adding site:", error)
      toast.error(t('errors.failedToAddSite'))
    }
  }

  const handleEditClick = (site: Site) => {
    setSelectedSite(site)
    setFormData({
      name: site.name,
      address: site.address || "",
      ctClient: site.ctClient || "",
      costCenter: site.costCenter,
      numberOfWorkers: site.numberOfWorkers.toString(),
      supervisorCode: site.supervisorCode,
      zone: site.zone,
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateSite = async () => {
    if (!selectedSite) return

    try {
      const response = await instance.put(`/companySite/update/${selectedSite._id}`, {
        name: formData.name,
        address: formData.address,
        ctClient: formData.ctClient,
        costCenter: formData.costCenter,
        numberOfWorkers: parseInt(formData.numberOfWorkers),
        supervisorCode: formData.supervisorCode,
        zone: formData.zone,
      })

      if (response.status === 200) {
        toast.success(t('success.siteUpdated'))
        setIsEditModalOpen(false)
        // Refresh data
        const refreshResponse = await instance.get(`/companySite?size=500`)
        const refreshedSites = refreshResponse.data.data.data.filter((site: Site) => site.clientCode === clientCode)
        setData(refreshedSites)
      }
    } catch (error) {
      console.error("Error updating site:", error)
      toast.error(t('errors.failedToUpdateSite'))
    }
  }

  const handleDeleteSite = async (siteId: string) => {
    // Implement delete logic here, probably with a confirmation dialog
    toast.info("Delete functionality not implemented yet.")
  }

  const handleViewSupervisions = async (site: Site) => {
    if (site.supervisorCode) {
      await fetchSupervisionCount(site.supervisorCode)
      // Open modal to show supervisions. For now, just logging.
      console.log(`Total supervisions for ${site.supervisorCode}: ${supervisionCount}`)
      toast.info(`Total de ${supervisionCount} supervisões para o supervisor ${site.supervisorCode}.`)
    } else {
      toast.info(t('warnings.noSupervisorCode'))
    }
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

  // Gere as zonas únicas dos sites do cliente
  const zonasUnicas = Array.from(new Set(data.map(site => site.zone).filter(Boolean)));

  return (
    <div className="container p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <BreadcrumbRoutas 
          title={companyName ? `${t('title')} - ${companyName}` : t('title')} 
          showBackButton 
        />
        <div>
          <AlertDialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-black text-white cursor-pointer">
                <Plus className="h-4 w-4" />
                {t('buttons.addSite')}{" "}
               
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('modals.addSite.title')}{" "}
                  {companyName ? `- ${companyName}` : ""}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('modals.addSite.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <label htmlFor="name">{t('fields.name')}:</label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder={t('placeholders.name')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address">{t('fields.address')}:</label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange}
                    placeholder={t('placeholders.address')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ctClient">{t('fields.ctClient')}:</label>
                  <Input 
                    id="ctClient" 
                    name="ctClient" 
                    value={formData.ctClient} 
                    onChange={handleInputChange}
                    placeholder={t('placeholders.ctClient')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="costCenter">{t('fields.costCenter')}:</label>
                  <Input 
                    id="costCenter" 
                    name="costCenter" 
                    value={formData.costCenter} 
                    onChange={handleInputChange}
                    placeholder={t('placeholders.costCenter')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="numberOfWorkers">{t('fields.numberOfWorkers')}:</label>
                  <Input 
                    id="numberOfWorkers" 
                    name="numberOfWorkers" 
                    type="number" 
                    value={formData.numberOfWorkers} 
                    onChange={handleInputChange}
                    placeholder={t('placeholders.numberOfWorkers')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="supervisorCode">{t('fields.supervisorCode')}:</label>
                  <Input 
                    id="supervisorCode" 
                    name="supervisorCode" 
                    value={formData.supervisorCode} 
                    onChange={handleInputChange}
                    placeholder={t('placeholders.supervisorCode')} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="zone">{t('fields.zone')}:</label>
                  <Select
                    value={formData.zone}
                    onValueChange={value => setFormData(f => ({ ...f, zone: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('placeholders.zone')} />
                    </SelectTrigger>
                    <SelectContent>
                      {zonasUnicas.length > 0 ? (
                        zonasUnicas.map(zona => (
                          <SelectItem key={zona} value={zona}>{zona}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Nenhuma zona disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddSite}>{t('buttons.add')}</AlertDialogAction>
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
          onAddClick={() => setIsAddModalOpen(true)}
          handleViewDetails={handleOpenSiteDetail} 
        />
        
        {/* Edit Modal */}
        <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedSite?.name ? `Editar Site - ${selectedSite.name}` : t('modals.editSite.title')}
              </AlertDialogTitle>
              <AlertDialogDescription>{t('modals.editSite.description')}</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <label htmlFor="edit-name">{t('fields.name')}:</label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-address">{t('fields.address')}:</label>
                <Input id="edit-address" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-ctClient">{t('fields.ctClient')}:</label>
                <Input id="edit-ctClient" name="ctClient" value={formData.ctClient} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-costCenter">{t('fields.costCenter')}:</label>
                <Input id="edit-costCenter" name="costCenter" value={formData.costCenter} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-numberOfWorkers">{t('fields.numberOfWorkers')}:</label>
                <Input id="edit-numberOfWorkers" name="numberOfWorkers" type="number" value={formData.numberOfWorkers} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-supervisorCode">{t('fields.supervisorCode')}:</label>
                <Input id="edit-supervisorCode" name="supervisorCode" value={formData.supervisorCode} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-zone">{t('fields.zone')}:</label>
                <Input id="edit-zone" name="zone" value={formData.zone} onChange={handleInputChange} />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateSite}>{t('buttons.save')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <GenericDetailModal
          isOpen={isCompanyInfoModalOpen}
          onClose={() => setIsCompanyInfoModalOpen(false)}
          title={t('modals.companyInfo.title')}
          description={t('modals.companyInfo.description')}
          icon={Info}
        >
          <div className="space-y-6 py-4">
            {selectedSite && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 border-b pb-2">{t('modals.companyInfo.siteInfo')}</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-700">{t('fields.name')}:</span>
                      <span className="text-gray-900">{selectedSite.name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-700">{t('fields.costCenter')}:</span>
                      <span className="text-gray-900">{selectedSite.costCenter}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-700">{t('fields.supervisorCode')}:</span>
                      <span className="text-gray-900">{selectedSite.supervisorCode}</span>
                    </p>
                  </div>
                </div>
                
                {companyInfo && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900 border-b pb-2">{t('modals.companyInfo.companyDetails')}</h3>
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">{t('fields.name')}:</span>
                        <span className="text-gray-900">{companyInfo.name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">{t('fields.address')}:</span>
                        <span className="text-gray-900">{companyInfo.address}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">{t('modals.companyInfo.contactInfo')}:</span>
                        <span className="text-gray-900">{companyInfo.contactInfo}</span>
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{t('modals.companyInfo.totalSupervisions')}:</span>
                    <span className="text-blue-600 font-semibold text-lg">{supervisionCount}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </GenericDetailModal>

        <GenericDetailModal
          isOpen={isSiteDetailModalOpen}
          onClose={() => setIsSiteDetailModalOpen(false)}
          title={selectedSite ? `Detalhes - ${selectedSite.name}` : "Detalhes do Site"}
          icon={Eye}
        >
          {selectedSite ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 flex flex-col">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Centro de Custo</span>
                <span className="text-gray-900 dark:text-gray-100">{selectedSite.costCenter || "N/A"}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 flex flex-col">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Nº de Tl</span>
                <span className="text-gray-900 dark:text-gray-100">{selectedSite.numberOfWorkers ?? "N/A"}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 flex flex-col">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Zona</span>
                <span className="text-gray-900 dark:text-gray-100">{selectedSite.zone || "N/A"}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 flex flex-col">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Código do Supervisor</span>
                <span className="text-gray-900 dark:text-gray-100">{selectedSite.supervisorCode || "N/A"}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 flex flex-col">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Código do Cliente</span>
                <span className="text-gray-900 dark:text-gray-100">{selectedSite.clientCode || "N/A"}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 flex flex-col sm:col-span-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Endereço</span>
                <span className="text-gray-900 dark:text-gray-100">{selectedSite.address || "N/A"}</span>
              </div>
            </div>
          ) : (
            <div>A carregar informações...</div>
          )}
        </GenericDetailModal>
      </div>
    </div>
  )
}
