import type React from "react"
import { TriangleAlert } from "lucide-react"
import { usePermissionStore } from "../../../../hooks/permission-store"


interface PermissionGuardProps {
  module: string
  action: "create" | "read" | "update" | "delete"
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  module, 
  action, 
  children, 
  fallback 
}) => {
  const hasPermission = usePermissionStore((state) => state.hasPermission)

  if (!hasPermission(module, action)) {
    return (
      fallback || (
        <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <TriangleAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium text-sm">Acesso Negado</p>
            <p className="text-xs">
              Você não tem permissão para{" "}
              {action === "create"
                ? "criar"
                : action === "read"
                  ? "visualizar"
                  : action === "update"
                    ? "editar"
                    : "excluir"}{" "}
            
            </p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
