"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, UserCheck, Trash2, MessageCircle, Edit, Shield, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../ulils/data-table"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Label } from "../../ui/label"
import instance from "@/lib/api"
import { companyAdapter } from "@/features/application/infrastructure/factories/CompanyFactory"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../ui/alert-dialog"
import { useAuth } from "@/hooks/useAuth"

interface Company {
  _id: string
  name: string
  logo?: string
  clientCode: string
  sites: number
  occurrences: number
  createdAt: string
}

interface ApiResponse<T> {
  data: {
    data: T
    total?: number
    page?: number
    size?: number
  }
  status: number
  message: string
}

export default function CompanyTable() {
  const router = useRouter()
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false)
  const [clientName, setClientName] = useState<string>("")
  const [clientCode, setClientCode] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDisableAlertOpen, setIsDisableAlertOpen] = useState(false)
  const [editCompanyData, setEditCompanyData] = useState<Partial<Company>>({})

  const columns: ColumnDef<Company>[] = React.useMemo(
    () => [
      {
        accessorKey: "clientCode",
        header: "Código",
        cell: ({ row }) => (
          <span 
            className="cursor-pointer"
            onClick={() => handleCompanyClick(row.original)}
          >
            {row.original.clientCode}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <span
            className="cursor-pointer "
            onClick={() => handleCompanyClick(row.original)}
          >
            {row.original.name}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const company = row.original
          return (
            <div className="flex gap-1">
              <span
                title="Editar"
                onClick={(e) => { e.stopPropagation(); setSelectedCompany(company); setEditCompanyData(company); setIsEditDialogOpen(true); }}
                className="p-1 hover:bg-blue-100 cursor-pointer rounded transition-colors"
              >
                <Edit className="h-3.5 w-3.5 text-blue-600" />
              </span>
              <span
                title="Desativar"
                onClick={(e) => { e.stopPropagation(); setSelectedCompany(company); setIsDisableAlertOpen(true); }}
                className="p-1 rounded transition-colors text-red-600 hover:bg-red-100 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </span>
            </div>
          )
        },
        size: 80,
      },
    ],
    []
  )

  const fetchCompanies = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await instance.get<ApiResponse<Company>>(`/company?size=500`)
      setTimeout(() => {
        const dataArray = Array.isArray(response.data.data.data)
          ? response.data.data.data
          : [response.data.data.data]
        setCompanies(dataArray)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Erro ao buscar empresas:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleCompanyClick = (company: Company): void => {
    setSelectedCompany(company)
    setIsDialogOpen(true)
  }

  const handleNavigateToDetail = (
    type: "site" | "occurrence" | "supervisao" | "inspeccao" | "recolhas" | "reclamacoes"
  ): void => {
    setIsDialogOpen(false)
    if (selectedCompany) {
      const params = new URLSearchParams({
        clientCode: selectedCompany.clientCode,
        companyName: selectedCompany.name,
      })

      if (type === "site") {
        router.push(`/dashboard/configuracoes/clientes/site/?${params.toString()}`)
      } else if (type === "occurrence") {
        router.push(`/dashboard/configuracoes/clientes/ocorrencia?${params.toString()}`)
      } else if (type === "supervisao") {
        router.push(`/dashboard/cliente/configuracoes/supervisao?${params.toString()}`)
      } else if (type === "inspeccao") {
        router.push(`/dashboard/inspeccao?${params.toString()}`)
      } else if (type === "recolhas") {
        router.push(`/dashboard/recolhas?${params.toString()}`)
      } else if (type === "reclamacoes") {
        router.push(`/dashboard/reclamacoes?${params.toString()}`)
      }
    }
  }
  
  const createCompany = async (): Promise<void> => {
    if (!clientName || !clientCode) {
      toast.error("Preencha todos os campos")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await instance.post<ApiResponse<Company>>(`/company/create`, {
        name: clientName,
        clientCode: clientCode,
      })

      if (response.data.status === 200) {
        toast.success("Cliente cadastrado com sucesso")
        setIsAddClientDialogOpen(false)
        setClientName("")
        setClientCode("")
        fetchCompanies()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCompany = async () => {
    if (!selectedCompany) return
    if (!user?._id) {
      toast.error("Usuário não autenticado")
      return
    }
    setIsSubmitting(true)
    try {
      const { clientCode, ...dataToUpdate } = editCompanyData;
      await companyAdapter.updateCompany(selectedCompany._id, user._id, dataToUpdate)
      toast.success("Empresa atualizada com sucesso")
      setIsEditDialogOpen(false)
      fetchCompanies()
    } catch (error) {
      toast.error("Erro ao atualizar empresa")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisableCompany = async () => {
    if (!selectedCompany) return
    if (!user?._id) {
      toast.error("Usuário não autenticado")
      return
    }
    setIsSubmitting(true)
    try {
      await companyAdapter.disableCompany(selectedCompany._id, user._id)
      toast.success("Empresa desativada com sucesso")
      setIsDisableAlertOpen(false)
      fetchCompanies()
    } catch (error) {
      toast.error("Erro ao desativar empresa")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
   <div className="grid grid-cols-1 gap-6 pb-6">
      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        title="Clientes"
        filterOptions={{
          enableNameFilter: true,
          enableAddButton: true,
          addButtonLabel: "Adicionar Cliente",
          enableExportButton: true,
          exportButtonLabel: "Exportar Clientes",
          exportFileName: "clientes.xlsx",
        }}
        onAddClick={() => setIsAddClientDialogOpen(true)}
        initialColumnVisibility={{
          clientCode: true,
          name: true,
          actions: true
        }}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg ">
          <DialogHeader>
            <DialogTitle className="text-base">
              <span>{selectedCompany?.clientCode} - </span>
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>Selecione uma opção para ver mais detalhes</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card Sites */}
            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("site")}
            >
              <CardHeader className=" justify-center items-center">
                <CardTitle className="text-base text-gray-700">Sites</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 justify-center items-center">
                <Building2 className="text-gray-500" size={22} />
              </CardContent>
            </Card>

            {/* Card Ocorrências */}
            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("occurrence")}
            >
              <CardHeader className="justify-center items-center">
                <CardTitle className="text-base text-gray-700">Ocorrências</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <AlertTriangle className="text-gray-500" size={24} />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("supervisao")}
            >
              <CardHeader className=" justify-center items-center">
                <CardTitle className="text-base text-gray-700">Supervisão</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <Shield className="text-gray-500" size={24} />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("inspeccao")}
            >
              <CardHeader className=" justify-center items-center">
                <CardTitle className="text-base text-gray-700">Inspecção</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <UserCheck className="text-gray-500" size={23} />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("recolhas")}
            >
              <CardHeader className="justify-center items-center">
                <CardTitle className="text-base text-gray-700">Recolhas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <Trash2 className="text-gray-500" size={24} />
              </CardContent>
            </Card>

            {/* Card Reclamacoes */}
            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("reclamacoes")}
            >
              <CardHeader className="justify-center items-center">
                <CardTitle className="text-base text-gray-700">Reclamações</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <MessageCircle className="text-gray-500" size={24} />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Adicionar Cliente</DialogTitle>
            <DialogDescription>Preencha os campos abaixo para cadastrar um novo cliente</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-4">
              <Label htmlFor="clientCode" className="text-right">
                Código do Cliente:
              </Label>
              <Input
                id="clientCode"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                placeholder="Código do Cliente"
                className="col-span-3"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="name" className="text-right">
                Nome:
              </Label>
              <Input
                id="name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do Cliente"
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddClientDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={createCompany} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
              <Label htmlFor="editClientCode">Código do Cliente:</Label>
            <Input id="editClientCode" value={editCompanyData.clientCode || ""} onChange={e => setEditCompanyData({ ...editCompanyData, clientCode: e.target.value })} />
         
            <Label htmlFor="editName">Nome:</Label>
            <Input id="editName" value={editCompanyData.name || ""} onChange={e => setEditCompanyData({ ...editCompanyData, name: e.target.value })} />
           </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditCompany} disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Company Alert */}
      <AlertDialog open={isDisableAlertOpen} onOpenChange={setIsDisableAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Empresa</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Tem certeza que deseja desativar esta empresa?</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableCompany} disabled={isSubmitting}>{isSubmitting ? "Desativando..." : "Desativar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}