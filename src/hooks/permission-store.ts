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

interface PermissionStore {
  currentUser: User | null
  userRole: Role | null
  permissions: {
    [module: string]: Permission
  }
  setCurrentUser: (user: User) => void
  setUserRole: (role: Role) => void
  canCreate: (module: string) => boolean
  canRead: (module: string) => boolean
  canUpdate: (module: string) => boolean
  canDelete: (module: string) => boolean
  isBackoffice: () => boolean
  hasPermission: (module: string, action: "create" | "read" | "update" | "delete") => boolean
  updateUserPermissions: (userId: string, permissions: { [module: string]: Permission }) => void
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

      setCurrentUser: (user) => set({ currentUser: user }),

      setUserRole: (role) => {
        const isBackoffice = role.name.toLowerCase() === "backoffice" || role.roler === 1
        const allPermissions = { create: true, read: true, update: true, delete: true }
        const permissions = isBackoffice
          ? {
              users: allPermissions,
              content: allPermissions,
              reports: allPermissions,
              settings: allPermissions,
            }
          : {
              users: {
                create: role.roler <= 2,
                read: true,
                update: role.roler <= 2,
                delete: role.roler <= 2,
              },
              content: {
                create: role.roler <= 3,
                read: true,
                update: role.roler <= 2,
                delete: role.roler <= 2,
              },
              reports: {
                create: role.roler <= 3,
                read: true,
                update: role.roler <= 2,
                delete: role.roler <= 2,
              },
              settings: {
                create: role.roler <= 1,
                read: role.roler <= 2,
                update: role.roler <= 1,
                delete: role.roler <= 1,
              },
            }
        set({ userRole: role, permissions })
      },

      canCreate: (module) => get().permissions[module]?.create || false,
      canRead: (module) => get().permissions[module]?.read || false,
      canUpdate: (module) => get().permissions[module]?.update || false,
      canDelete: (module) => get().permissions[module]?.delete || false,

      isBackoffice: () => {
        const role = get().userRole
        return role?.name.toLowerCase() === "backoffice" || role?.roler === 1
      },

      hasPermission: (module, action) => {
        const permissions = get().permissions[module]
        return permissions?.[action] || false
      },

      updateUserPermissions: (userId, permissions) => {
        console.log("Updating permissions for user:", userId, permissions)
      },
    }),
    {
      name: "permission-store",
    },
  ),
)
