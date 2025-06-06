"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Shield,
  Settings,
  UserPlus,
} from "lucide-react"

export interface User {
  _id: string
  name: string
  email: string
  address: string
  phoneNumber: string
  password: string
  employeeId: string
  type: string
  mecCoordinator: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface UserType {
  _id: string
  name: string
  permissions: string[]
  description?: string
}

export interface CreateUserData {
  name: string
  email: string
  phoneNumber: string
  address: string
  employeeId: string
  type: string
  mecCoordinator: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [userTypes, setUserTypes] = useState<Map<string, UserType>>(new Map())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/`)
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function fetchUserType(typeId: string): Promise<UserType | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/userAuth/checkType/${typeId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch user type")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching user type:", error)
    return null
  }
}

export async function createUser(userData: CreateUserData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/userAuth/signIn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
    return response.ok
  } catch (error) {
    console.error("Error creating user:", error)
    return false
  }
}

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const usersData = await fetchUsers()
    setUsers(usersData)

    // Fetch user types for all users
    const typeIds = [...new Set(usersData.map((user) => user.type))]
    const typePromises = typeIds.map(async (typeId) => {
      const userType = await fetchUserType(typeId)
      return { typeId, userType }
    })

    const typeResults = await Promise.all(typePromises)
    const typeMap = new Map()
    typeResults.forEach(({ typeId, userType }) => {
      if (userType) {
        typeMap.set(typeId, userType)
      }
    })

    setUserTypes(typeMap)
    setLoading(false)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || user.type === selectedType
    return matchesSearch && matchesType && !user.deletedAt
  })

  const handleCreateUser = async (userData: CreateUserData) => {
    const success = await createUser(userData)
    if (success) {
      toast({
        title: "Success",
        description: "User created successfully",
      })
      setIsCreateDialogOpen(false)
      loadUsers()
    } else {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const getUserTypeDisplay = (typeId: string) => {
    const userType = userTypes.get(typeId)
    return userType?.name || "Unknown"
  }

  const getStatusBadge = (user: User) => {
    if (user.deletedAt) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">3s</span>
          <Badge variant="outline" className="text-green-600">
            Users limit (Upgrade)
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="accounting" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Accounting Firms
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles and Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Manage your team members and their access</CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New user
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create a new user</DialogTitle>
                      <DialogDescription>
                        Your new user will get an email with a QuickBooks link to create a username and password, unless
                        they've used QuickBooks before.
                      </DialogDescription>
                    </DialogHeader>
                    <CreateUserForm onSubmit={handleCreateUser} userTypes={userTypes} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {Array.from(userTypes.values()).map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More filters
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>EMAIL</TableHead>
                      <TableHead>ROLE</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-muted-foreground">No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getUserTypeDisplay(user.type)}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(user)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Edit
                                  <MoreHorizontal className="h-4 w-4 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounting Firms</CardTitle>
              <CardDescription>Manage accounting firm integrations and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Accounting firms management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RolesAndPermissions userTypes={userTypes} />
        </TabsContent>
      </Tabs>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && <UserDetailsView user={selectedUser} userType={userTypes.get(selectedUser.type)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateUserForm({
  onSubmit,
  userTypes,
}: {
  onSubmit: (data: CreateUserData) => void
  userTypes: Map<string, UserType>
}) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    employeeId: "",
    type: "", // Updated to have a non-empty string default value
    mecCoordinator: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Johnette Howard"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="johnette.howard@gumshoe.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number (optional)</Label>
        <Input
          id="phone"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="(408) 660-2289"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input
          id="employeeId"
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          placeholder="0557"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(userTypes.values()).map((type) => (
              <SelectItem key={type._id} value={type._id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coordinator">MEC Coordinator</Label>
        <Input
          id="coordinator"
          value={formData.mecCoordinator}
          onChange={(e) => setFormData({ ...formData, mecCoordinator: e.target.value })}
          placeholder="4398"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter address"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Create User</Button>
      </div>
    </form>
  )
}

function UserDetailsView({ user, userType }: { user: User; userType?: UserType }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
          <AvatarFallback className="text-lg">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <p className="text-muted-foreground">{userType?.name || "Unknown Role"}</p>
          <Badge variant={user.deletedAt ? "destructive" : "default"} className="mt-1">
            {user.deletedAt ? "Inactive" : "Active"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
          <p className="mt-1">{user.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
          <p className="mt-1">{user.phoneNumber || "Not provided"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
          <p className="mt-1">{user.employeeId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">MEC Coordinator</Label>
          <p className="mt-1">{user.mecCoordinator}</p>
        </div>
        <div className="col-span-2">
          <Label className="text-sm font-medium text-muted-foreground">Address</Label>
          <p className="mt-1">{user.address || "Not provided"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Created</Label>
          <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
          <p className="mt-1">{new Date(user.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {userType && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Permissions</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {userType.permissions.map((permission, index) => (
              <Badge key={index} variant="outline">
                {permission}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RolesAndPermissions({ userTypes }: { userTypes: Map<string, UserType> }) {
  const [selectedRole, setSelectedRole] = useState<string>("all") // Updated to have a non-empty string default value
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Roles and Permissions</CardTitle>
            <CardDescription>Define roles and assign permissions to users</CardDescription>
          </div>
          <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new role with specific permissions</DialogDescription>
              </DialogHeader>
              <CreateRoleForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Array.from(userTypes.values()).map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAME</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>MEMBERS</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(userTypes.values()).map((type) => (
                  <TableRow key={type._id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Custom Role</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{Math.floor(Math.random() * 10) + 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View
                            <MoreHorizontal className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateRoleForm() {
  const [roleName, setRoleName] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])

  const availablePermissions = [
    "Time activities: Add, Edit, Delete",
    "Assign service item",
    "Bill to customers",
    "Assign class",
    "Assign location",
  ]

  const togglePermission = (permission: string) => {
    setPermissions((prev) => (prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roleName">Role Name</Label>
        <Input
          id="roleName"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="Enter role name"
        />
      </div>

      <div className="space-y-2">
        <Label>Role's permissions</Label>
        <div className="space-y-2">
          {availablePermissions.map((permission) => (
            <div key={permission} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={permission}
                checked={permissions.includes(permission)}
                onChange={() => togglePermission(permission)}
                className="rounded border-gray-300"
              />
              <Label htmlFor={permission} className="text-sm">
                {permission}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Preview role</Button>
        <Button>Create Role</Button>
      </div>
    </div>
  )
}
