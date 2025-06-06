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
  Search,
  TriangleAlert,
  ChevronDown
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editedUser, setEditedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<{ [module: string]: Permission }>({})
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("all")

  const {
    currentUser,
    userRole,
    isBackoffice,
    isSupervisor,
    isCoordinator,
    hasPermission,
    setCurrentUser,
    setUserRole,
    updateUserPermissions,
    getUserPermissions,
  } = usePermissionStore()
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
      case 4:
        return "bg-red-100 text-red-800 border-red-200"
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case 3:
        return "bg-blue-100 text-blue-800 border-blue-200"
     
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleName = (roler: number) => {
    switch (roler) {
      case 4:
        return "Backoffice"
      case 2:
        return "Coordinator"
      case 3:
        return "Supervisor"
  
      default:
        return "Desconhecido"
    }
  }

  // Filtrar usuários por termo de pesquisa e função selecionada
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === "all" || 
      (user.role && user.role.roler.toString() === selectedRole)
    
    return matchesSearch && matchesRole
  })

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

  const getPermissionsForRole = (roler: number) => {
    if (roler === 4) {
      const allPermissions = { create: true, read: true, update: true, delete: true }
      return {
        users: allPermissions,
        content: allPermissions,
        reports: allPermissions,
        settings: allPermissions,
      }
    }

    if (roler === 2) {
      return {
        users: { create: true, read: true, update: true, delete: false },
        content: { create: true, read: true, update: true, delete: false },
        reports: { create: true, read: true, update: true, delete: false },
        settings: { create: false, read: true, update: false, delete: false },
      }
    }

    if (roler === 3) {
      return {
        users: { create: false, read: true, update: false, delete: false },
        content: { create: false, read: true, update: false, delete: false },
        reports: { create: false, read: true, update: false, delete: false },
        settings: { create: false, read: false, update: false, delete: false },
      }
    }

    return {
      users: { create: false, read: false, update: false, delete: false },
      content: { create: false, read: false, update: false, delete: false },
      reports: { create: false, read: false, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
            {row.getValue<string>("name").charAt(0).toUpperCase()}
          </div>
          <div className="font-medium text-gray-900">{row.getValue("name")}</div>
        </div>
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
              {getRoleName(role.roler)}
            </Badge>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Nível {role.roler}</span>
          </div>
        )
      },
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
            <DropdownMenuContent align="end" className="w-48">
              {hasPermission("users", "read") && (
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedUser(user)
                    setViewDialogOpen(true)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
              )}

              {hasPermission("users", "update") && (
                <DropdownMenuItem
                  onClick={() => {
                    setEditedUser(user)
                    setEditDialogOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}

              {hasPermission("users", "delete") && (
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
              )}

              {!hasPermission("users", "read") &&
                !hasPermission("users", "update") &&
                !hasPermission("users", "delete") && (
                  <DropdownMenuItem disabled className="text-gray-400">
                    <TriangleAlert className="mr-2 h-4 w-4" />
                    Sem permissões
                  </DropdownMenuItem>
                )}
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
            <PermissionGuard module="settings" action="update" showFallback={false}>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Permissões
              </TabsTrigger>
            </PermissionGuard>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Pesquisar utilizadores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filtrar por função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as funções</SelectItem>
                        <SelectItem value="4">Backoffice</SelectItem>
                        <SelectItem value="2">Coordinator</SelectItem>
                        <SelectItem value="3">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>

                    <PermissionGuard module="users" action="create" showFallback={false}>
                      <Button 
                        className="flex items-center gap-2"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <UserPlus className="w-4 h-4" />
                        Criar Utilizador
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={userColumns}
                  data={filteredUsers}
                  loading={isLoading}
                  filterOptions={{
                    enableSiteFilter: false,
                  }}
                />
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
                  {[4, 2, 3].map((roler) => {
                    const roleName = getRoleName(roler)
                    const permissions = getPermissionsForRole(roler)

                    return (
                      <Card key={roler} className='border-none shadow-none'>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getRoleBadgeColor(roler)}`}>
                                <Crown className="w-5 h-5" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{roleName}</CardTitle>
                                <CardDescription>Nível de acesso: {roler}</CardDescription>
                              </div>
                            </div>
                            <Badge className={`${getRoleBadgeColor(roler)} font-medium`}>Nível {roler}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {["users", "content", "settings"].map((module) => {
                              const modulePermissions = permissions[module]

                              return (
                                <Card key={module} className="p-4 bg-gray-50 border-none shadow-none">
                                  <h5 className="font-medium capitalize mb-3 text-gray-700 flex items-center">
                                    {module === "users" ? (
                                      <UsersIcon className="w-4 h-4 mr-2" />
                                    ) : module === "content" ? (
                                      <Edit className="w-4 h-4 mr-2" />
                                    ) : (
                                      <Settings className="w-4 h-4 mr-2" />
                                    )}
                                    {module === "users"
                                      ? "Utilizadores"
                                      : module === "content"
                                        ? "Conteúdo"
                                        : "Configurações"}
                                  </h5>
                                  <div className="space-y-2">
                                    {Object.entries(modulePermissions).map(([action, allowed]) => (
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
                    )
                  })}
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
                    Gestão de Permissões Individuais
                  </CardTitle>
                  <CardDescription>
                    Defina permissões específicas para utilizadores individuais (apenas Backoffice)
                  </CardDescription>
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
                              const existingPermissions = getUserPermissions(user._id)
                              setUserPermissions(
                                existingPermissions || {
                                  users: { create: false, read: true, update: false, delete: false },
                                  content: { create: false, read: true, update: false, delete: false },
                                  reports: { create: false, read: true, update: false, delete: false },
                                  settings: { create: false, read: false, update: false, delete: false },
                                },
                              )
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            {user.role && (
                              <Badge className={`${getRoleBadgeColor(user.role.roler)}`}>
                                {getRoleName(user.role.roler)}
                              </Badge>
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
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {selectedUserForPermissions.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>Definir Permissões para {selectedUserForPermissions.name}</div>
                            <div className="text-sm text-gray-500 font-normal">{selectedUserForPermissions.email}</div>
                            {selectedUserForPermissions.role && (
                              <Badge className={`${getRoleBadgeColor(selectedUserForPermissions.role.roler)} mt-1`}>
                                {getRoleName(selectedUserForPermissions.role.roler)}
                              </Badge>
                            )}
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
