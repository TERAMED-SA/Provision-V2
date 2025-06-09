import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Permission {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

interface Role {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  roler: number
}

interface User {
  _id: string
  name: string
  email: string
  address: string
  phoneNumber: string
  gender: string
  role?: Role
  status?: string
  createdAt: string
  employeeId?: string
  type?: string
}

interface UserPermissions {
  [userId: string]: {
    [module: string]: Permission
  }
}

interface PermissionStore {
  currentUser: User | null
  userRole: Role | null
  permissions: {
    [module: string]: Permission
  }
  userPermissions: UserPermissions
  setCurrentUser: (user: User) => void
  setUserRole: (role: Role) => void
  canCreate: (module: string) => boolean
  canRead: (module: string) => boolean
  canUpdate: (module: string) => boolean
  canDelete: (module: string) => boolean
  isBackoffice: () => boolean
  isSupervisor: () => boolean
  isCoordinator: () => boolean
  hasPermission: (module: string, action: "create" | "read" | "update" | "delete") => boolean
  updateUserPermissions: (userId: string, permissions: { [module: string]: Permission }) => void
  getUserPermissions: (userId: string) => { [module: string]: Permission } | null
}

const getDefaultPermissions = (roler: number) => {
  const isBackoffice = roler === 4
  const isCoordinator = roler === 2
  const isSupervisor = roler === 3

  if (isBackoffice) {
    const allPermissions = { create: true, read: true, update: true, delete: true }
    return {
      users: allPermissions,
      content: allPermissions,
      reports: allPermissions,
      settings: allPermissions,
    }
  }

  if (isCoordinator) {
    return {
      users: { create: true, read: true, update: true, delete: false },
      content: { create: true, read: true, update: true, delete: false },
      reports: { create: true, read: true, update: true, delete: false },
      settings: { create: false, read: true, update: false, delete: false },
    }
  }

  if (isSupervisor) {
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

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      userRole: null,
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        content: { create: false, read: false, update: false, delete: false },
        reports: { create: false, read: false, update: false, delete: false },
        settings: { create: false, read: false, update: false, delete: false },
      },
      userPermissions: {},

      setCurrentUser: (user) => set({ currentUser: user }),

      setUserRole: (role) => {
        const permissions = getDefaultPermissions(role.roler)
        set({ userRole: role, permissions })
      },

      canCreate: (module) => get().permissions[module]?.create || false,
      canRead: (module) => get().permissions[module]?.read || false,
      canUpdate: (module) => get().permissions[module]?.update || false,
      canDelete: (module) => get().permissions[module]?.delete || false,

      isBackoffice: () => {
        const role = get().userRole
        return role?.roler === 4
      },

      isSupervisor: () => {
        const role = get().userRole
        return role?.roler === 3
      },

      isCoordinator: () => {
        const role = get().userRole
        return role?.roler === 2
      },

      hasPermission: (module, action) => {
        const permissions = get().permissions[module]
        return permissions?.[action] || false
      },

      updateUserPermissions: (userId, permissions) => {
        set((state) => ({
          userPermissions: {
            ...state.userPermissions,
            [userId]: permissions,
          },
        }))
      },

      getUserPermissions: (userId) => {
        return get().userPermissions[userId] || null
      },
    }),
    {
      name: "permission-store",
    },
  ),
)
