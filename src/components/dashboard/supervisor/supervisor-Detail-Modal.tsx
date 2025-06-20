"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import type { Supervisor } from "@/features/application/domain/entities/Supervisor"
import { Loader2 } from "lucide-react"

export function SupervisorDetailModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      setLoading(true)
      setSupervisor(event.detail)
      setIsOpen(true)
      setLoading(false)
      console.log("Supervisor exibido no modal:", event.detail)
    }

    window.addEventListener("view-supervisor-detail", handleOpenModal as EventListener)

    return () => {
      window.removeEventListener("view-supervisor-detail", handleOpenModal as EventListener)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setSupervisor(null)
  }

  if (!supervisor && !loading) return null

  const formattedCreatedAt = supervisor?.createdAt
    ? format(new Date(supervisor.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "Data não disponível"

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Supervisor</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : supervisor ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
                <AvatarFallback className="text-lg">{supervisor.name?.charAt(0)?.toUpperCase() || "S"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{supervisor.name}</h3>
                <p className="text-sm text-muted-foreground">Código: {supervisor.employeeId || "N/A"}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bg-gray-50 rounded-lg   p-4">
                <h4 className="font-semibold mb-3">Informações Básicas</h4>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">Email: </span>
                    {supervisor.email || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Telefone: </span>
                    {supervisor.phoneNumber || "N/A"}
                  </div>
                  
                </div>
              </div>

              {supervisor.equipment && supervisor.equipment.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3">Equipamentos</h4>
                  <div className="space-y-3">
                    {supervisor.equipment.map((equip, index) => (
                      <div key={index} className="border rounded p-3 text-sm">
                        <div>
                          <span className="font-medium">Nome: </span>
                          {equip.name || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Número de Série: </span>
                          {equip.serialNumber || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Estado: </span>
                          {equip.state || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Centro de Custo: </span>
                          {equip.costCenter || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Observações: </span>
                          {equip.obs || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {supervisor.report && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3">Relatório</h4>
                  <p className="text-sm whitespace-pre-wrap">{supervisor.report}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <p>Nenhum dado do supervisor encontrado.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
