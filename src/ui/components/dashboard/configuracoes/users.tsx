"use client"
import React, { useState, useEffect } from 'react';
import { BreadcrumbRoutas } from '../../ulils/breadcrumbRoutas';
import { Button } from '../../ui/button';

import { 
  ArrowUpDown, 
  Eye, 
  Edit, 
  Check, 
  X, 
  UserPlus,
  Shield,
  Users as UsersIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Settings,
  Trash2,
  MoreHorizontal,
  Search
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import instance from '@/src/lib/api';
import { getUser } from '@/src/features/services/auth/authApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { usePermissionStore } from '../../../../hooks/permission-store';
import { PermissionGuard } from './permission-guard';
import { useRoleApi } from '@/src/hooks/use-role-api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Checkbox } from '../../ui/checkbox';
import { Separator } from '../../ui/separator';
import { DataTable } from '../../ulils/data-table';


interface User {
  _id: string
  name: string
  email: string
  address: string
  phoneNumber: string
  gender: string
  role?: {
    _id: string
    name: string
    roler: number
  }
  status?: string
  createdAt: string
  employeeId?: string
  type?: string
}

interface Role {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  roler: number
}

interface Permission {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editedUser, setEditedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<{ [module: string]: Permission }>({})
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { currentUser, userRole, isBackoffice, hasPermission, setCurrentUser, setUserRole, updateUserPermissions } =
    usePermissionStore()
  const { fetchUserRole, loading: roleLoading } = useRoleApi()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
    gender: "M",
    employeeId: "",
    roler: "",
  })

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await getUser()
        setCurrentUser(user)

        if (user.type) {
          const role = await fetchUserRole(user.type)
          if (role) {
            setUserRole(role)
          }
        }
      } catch (error) {
        console.error("Error initializing user:", error)
      }
    }

    initializeUser()
  }, [setCurrentUser, setUserRole, fetchUserRole])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await instance.get("/user?size=100")

      if (response.data && Array.isArray(response.data.data.data)) {
        const usersWithRoles = await Promise.all(
          response.data.data.data.map(async (user: User) => {
            if (user.type) {
              const role = await fetchUserRole(user.type)
              return { ...user, role }
            }
            return user
          }),
        )
        setUsers(usersWithRoles)
      }
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao carregar utilizadores")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    if (!isBackoffice()) {
      toast.error("Apenas utilizadores backoffice podem criar novos utilizadores")
      return
    }

    try {
      const user = await getUser()
      const response = await instance.post(`/userAuth/signUp?roler=${formData.roler || 3}`, {
        ...formData,
        password: "",
        codeEstablishment: "",
        admissionDate: "",
        situation: "",
        departmentCode: "",
        mecCoordinator: user,
      })

      if (response.data.data.status === 201) {
        toast.success("Utilizador cadastrado com sucesso")
        fetchUsers()
        resetForm()
        setCreateDialogOpen(false)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.data?.message || "Erro ao criar utilizador")
    }
  }

  const updateUser = async () => {
    if (!editedUser || !hasPermission("users", "update")) {
      toast.error("Sem permissão para editar utilizadores")
      return
    }

    try {
      await instance.put(`/user/updateMe/${editedUser._id}`, {
        name: editedUser.name,
        email: editedUser.email,
        address: editedUser.address,
        gender: editedUser.gender,
        phoneNumber: editedUser.phoneNumber,
      })

      toast.success("Utilizador atualizado com sucesso")
      fetchUsers()
      setEditedUser(null)
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      toast.error("Erro ao atualizar utilizador")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!hasPermission("users", "delete")) {
      toast.error("Sem permissão para excluir utilizadores")
      return
    }

    try {
      await instance.delete(`/user/${userId}`)
      toast.success("Utilizador excluído com sucesso")
      fetchUsers()
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      toast.error("Erro ao excluir utilizador")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      phoneNumber: "",
      gender: "M",
      employeeId: "",
      roler: "",
    })
  }

  const getRoleBadgeColor = (roler: number) => {
    switch (roler) {
      case 1:
        return "bg-red-100 text-red-800 border-red-200"
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case 3:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 4:
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePermissionChange = (module: string, action: keyof Permission, checked: boolean) => {
    setUserPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: checked,
      },
    }))
  }

  const saveUserPermissions = async () => {
    if (selectedUserForPermissions) {
      try {
        // Call your API to update user permissions
        updateUserPermissions(selectedUserForPermissions._id, userPermissions)
        toast.success("Permissões atualizadas com sucesso")
        setSelectedUserForPermissions(null)
        setUserPermissions({})
      } catch (error) {
        console.error("Erro ao salvar permissões:", error)
        toast.error("Erro ao salvar permissões")
      }
    }
  }

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gray-50 -ml-4"
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
          <div className="font-medium text-gray-900">{row.getValue("name")}</div>
           
      
      ),
    },
    {
      accessorKey: "role",
      header: "Função",
      cell: ({ row }) => {
        const role = row.original.role
        if (!role) {
          return (
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              Sem função
            </Badge>
          )
        }

        return (
          <div className="flex items-center space-x-2">
            <Badge className={`${getRoleBadgeColor(role.roler)} font-medium`} variant="outline">
              {role.name}
            </Badge>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Nível {role.roler}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Ativo
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Data de Criação",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">{new Date(row.getValue("createdAt")).toLocaleDateString("pt-PT")}</div>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PermissionGuard module="users" action="read">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xl font-semibold">{user.name}</div>
                          {user.role && (
                            <Badge className={`${getRoleBadgeColor(user.role.roler)} mt-1`}>
                              <Crown className="w-3 h-3 mr-1" />
                              {user.role.name}
                            </Badge>
                          )}
                        </div>
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Telefone</p>
                          <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Endereço</p>
                          <p className="font-medium text-gray-900">{user.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Data de Criação</p>
                          <p className="font-medium text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString("pt-PT")}
                          </p>
                        </div>
                      </div>
                      {user.employeeId && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <UsersIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">ID do Funcionário</p>
                            <p className="font-medium text-gray-900">{user.employeeId}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Fechar</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PermissionGuard>

              <PermissionGuard module="users" action="update">
                <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        setEditedUser(user)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Editar Utilizador</AlertDialogTitle>
                      <AlertDialogDescription>Faça alterações nas informações do utilizador</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Nome</Label>
                        <Input
                          id="edit-name"
                          value={editedUser?.name || ""}
                          onChange={(e) => setEditedUser(editedUser ? { ...editedUser, name: e.target.value } : null)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editedUser?.email || ""}
                          onChange={(e) => setEditedUser(editedUser ? { ...editedUser, email: e.target.value } : null)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-address">Endereço</Label>
                        <Input
                          id="edit-address"
                          value={editedUser?.address || ""}
                          onChange={(e) =>
                            setEditedUser(editedUser ? { ...editedUser, address: e.target.value } : null)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-phone">Telefone</Label>
                        <Input
                          id="edit-phone"
                          value={editedUser?.phoneNumber || ""}
                          onChange={(e) =>
                            setEditedUser(editedUser ? { ...editedUser, phoneNumber: e.target.value } : null)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-gender">Gênero</Label>
                        <Select
                          value={editedUser?.gender || "M"}
                          onValueChange={(value) => setEditedUser(editedUser ? { ...editedUser, gender: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setEditedUser(null)
                          setEditDialogOpen(false)
                        }}
                      >
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={updateUser}>Salvar Alterações</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PermissionGuard>

              <PermissionGuard module="users" action="delete">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o utilizador <strong>{user.name}</strong>? Esta ação não pode ser
                        desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Utilizadores</h1>
          <p className="text-gray-600">Gerencie utilizadores, funções e permissões do sistema</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Utilizadores
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Funções
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               
                  <div className="flex flex-col sm:flex-row gap-2">
                   
                    <PermissionGuard module="users" action="create">
                      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Criar Utilizador
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Criar Novo Utilizador</AlertDialogTitle>
                            <AlertDialogDescription>
                              Preencha os dados para criar um novo utilizador
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Nome</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nome completo"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@exemplo.com"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="address">Endereço</Label>
                              <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Endereço completo"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="phone">Telefone</Label>
                              <Input
                                id="phone"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="9xxxxxxxx"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="gender">Gênero</Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="M">Masculino</SelectItem>
                                  <SelectItem value="F">Feminino</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="employeeId">ID do Funcionário</Label>
                              <Input
                                id="employeeId"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                placeholder="ID do funcionário"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="role">Função</Label>
                              <Select
                                value={formData.roler}
                                onValueChange={(value) => setFormData({ ...formData, roler: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma função" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role._id} value={role.roler.toString()}>
                                      {role.name} (Nível {role.roler})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => {
                                resetForm()
                                setCreateDialogOpen(false)
                              }}
                            >
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleAddUser}>Criar Utilizador</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </PermissionGuard>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable columns={userColumns}
                 data={filteredUsers} 
                  filterOptions={{
                    enableSiteFilter: false,
                    enableDateFilter: false,
                  }}/>
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Carregando utilizadores...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Funções do Sistema
                </CardTitle>
                <CardDescription>Visualize as funções disponíveis e suas permissões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {roles.map((role) => (
                    <Card key={role._id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getRoleBadgeColor(role.roler)}`}>
                              <Crown className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{role.name}</CardTitle>
                              <CardDescription>
                                Nível de acesso: {role.roler} • Criado em{" "}
                                {new Date(role.createdAt).toLocaleDateString("pt-PT")}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={`${getRoleBadgeColor(role.roler)} font-medium`}>Nível {role.roler}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {["users", "content", "reports", "settings"].map((module) => {
                            const permissions = {
                              create: role.roler <= (module === "settings" ? 1 : module === "users" ? 2 : 3),
                              read: true,
                              update: role.roler <= (module === "settings" ? 1 : 2),
                              delete: role.roler <= (module === "settings" ? 1 : 2),
                            }

                            return (
                              <Card key={module} className="p-4 bg-gray-50">
                                <h5 className="font-medium capitalize mb-3 text-gray-700 flex items-center">
                                  {module === "users" ? (
                                    <UsersIcon className="w-4 h-4 mr-2" />
                                  ) : module === "content" ? (
                                    <Edit className="w-4 h-4 mr-2" />
                                  ) : module === "reports" ? (
                                    <Eye className="w-4 h-4 mr-2" />
                                  ) : (
                                    <Settings className="w-4 h-4 mr-2" />
                                  )}
                                  {module === "users"
                                    ? "Utilizadores"
                                    : module === "content"
                                      ? "Conteúdo"
                                      : module === "reports"
                                        ? "Relatórios"
                                        : "Configurações"}
                                </h5>
                                <div className="space-y-2">
                                  {Object.entries(permissions).map(([action, allowed]) => (
                                    <div key={action} className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">
                                        {action === "create"
                                          ? "Criar"
                                          : action === "read"
                                            ? "Ver"
                                            : action === "update"
                                              ? "Editar"
                                              : "Excluir"}
                                      </span>
                                      {allowed ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <X className="w-4 h-4 text-red-500" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <PermissionGuard module="settings" action="update">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Gestão de Permissões
                  </CardTitle>
                  <CardDescription>Defina permissões específicas para utilizadores individuais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="user-search">Pesquisar Utilizador</Label>
                      <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="user-search"
                          placeholder="Digite o nome ou email do utilizador..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {searchTerm && (
                    <div className="space-y-2">
                      <Label>Resultados da Pesquisa</Label>
                      <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                        {filteredUsers.slice(0, 5).map((user) => (
                          <div
                            key={user._id}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            onClick={() => {
                              setSelectedUserForPermissions(user)
                              setUserPermissions({
                                users: { create: false, read: true, update: false, delete: false },
                                content: { create: false, read: true, update: false, delete: false },
                                reports: { create: false, read: true, update: false, delete: false },
                                settings: { create: false, read: false, update: false, delete: false },
                              })
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            {user.role && (
                              <Badge className={`${getRoleBadgeColor(user.role.roler)}`}>{user.role.name}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUserForPermissions && (
                    <Card className="border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {selectedUserForPermissions.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>Definir Permissões para {selectedUserForPermissions.name}</div>
                            <div className="text-sm text-gray-500 font-normal">{selectedUserForPermissions.email}</div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {["users", "content", "reports", "settings"].map((module) => (
                            <Card key={module} className="p-4">
                              <h4 className="font-medium mb-4 flex items-center">
                                {module === "users" ? (
                                  <UsersIcon className="w-4 h-4 mr-2" />
                                ) : module === "content" ? (
                                  <Edit className="w-4 h-4 mr-2" />
                                ) : module === "reports" ? (
                                  <Eye className="w-4 h-4 mr-2" />
                                ) : (
                                  <Settings className="w-4 h-4 mr-2" />
                                )}
                                {module === "users"
                                  ? "Utilizadores"
                                  : module === "content"
                                    ? "Conteúdo"
                                    : module === "reports"
                                      ? "Relatórios"
                                      : "Configurações"}
                              </h4>
                              <div className="space-y-3">
                                {["create", "read", "update", "delete"].map((action) => (
                                  <div key={action} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${module}-${action}`}
                                      checked={userPermissions[module]?.[action as keyof Permission] || false}
                                      onCheckedChange={(checked) =>
                                        handlePermissionChange(module, action as keyof Permission, checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${module}-${action}`} className="text-sm">
                                      {action === "create"
                                        ? "Criar"
                                        : action === "read"
                                          ? "Visualizar"
                                          : action === "update"
                                            ? "Editar"
                                            : "Excluir"}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          ))}
                        </div>
                        <Separator className="my-6" />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedUserForPermissions(null)
                              setUserPermissions({})
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={saveUserPermissions}>Salvar Permissões</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </PermissionGuard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
