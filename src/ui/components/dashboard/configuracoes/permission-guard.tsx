import type React from "react"
import { TriangleAlert } from "lucide-react"
import { usePermissionStore } from "../../../../hooks/permission-store"


interface PermissionGuardProps {
  module: string
  action: "create" | "read" | "update" | "delete"
  children: React.ReactNode
  fallback?: React.ReactNode
  showFallback?: boolean
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  module, 
  action, 
  children, 
  fallback,
  showFallback = true
}) => {
  const hasPermission = usePermissionStore((state) => state.hasPermission)

  if (!hasPermission(module, action)) {
    if (!showFallback) {
      return null
    }

    return (
      fallback || (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <TriangleAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-amber-800">
            <p className="font-medium">Acesso Negado</p>
            <p className="text-xs opacity-90">
              Sem permissão para{" "}
              {action === "create"
                ? "criar"
                : action === "read"
                  ? "visualizar"
                  : action === "update"
                    ? "editar"
                    : "excluir"}
            </p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

