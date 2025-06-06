import { cn } from "@/src/lib/utils"

interface UserStatusProps {
  status: "online" | "offline" | "away" | "busy"
  className?: string
}

export default function UserStatus({ status, className }: UserStatusProps) {
  return (
    <div className={cn("flex items-center text-xs text-muted-foreground", className)}>
      {status === "online" && (
        <>
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Online
        </>
      )}
      {status === "offline" && (
        <>
          <span className="relative flex h-2 w-2 mr-1">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
          </span>
          Offline
        </>
      )}
      {status === "away" && (
        <>
          <span className="relative flex h-2 w-2 mr-1">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
            Ausente
        </>
      )}
      {status === "busy" && (
        <>
          <span className="relative flex h-2 w-2 mr-1">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Ocupado
        </>
      )}
    </div>
  )
}
