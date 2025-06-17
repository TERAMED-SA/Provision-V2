"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Supervisor } from "@/features/application/domain/entities/Supervisor"

export function SupervisorDetailModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null)

  useEffect(() => {
    const handleOpenModal = (event: CustomEvent<Supervisor>) => {
      setSupervisor(event.detail)
      setIsOpen(true)
    }

    window.addEventListener('view-supervisor-detail', handleOpenModal as EventListener)

    return () => {
      window.removeEventListener('view-supervisor-detail', handleOpenModal as EventListener)
    }
  }, [])

  if (!supervisor) return null

  const formattedCreatedAt = supervisor.createdAt 
    ? format(new Date(supervisor.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) 
    : "Data não disponível"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Detalhes do Supervisor</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center mb-4">
          <h3 className="text-xl font-bold">{supervisor.name}</h3>
          <p className="text-gray-500">Código: {supervisor.supervisorCode}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Informações Básicas</h4>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Tempo:</span> {supervisor.time}</p>
              <p><span className="font-medium">Centro de Custo:</span> {supervisor.costCenter}</p>
              <p><span className="font-medium">Data de Criação:</span> {formattedCreatedAt}</p>
              <p><span className="font-medium">Trabalhadores Encontrados:</span> {supervisor.workersFound}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Equipamentos</h4>
            <div className="mt-2 space-y-2">
              {supervisor.equipment.map((equip, index) => (
                <div key={index} className="border p-2 rounded">
                  <p><span className="font-medium">Nome:</span> {equip.name}</p>
                  <p><span className="font-medium">Número de Série:</span> {equip.serialNumber}</p>
                  <p><span className="font-medium">Estado:</span> {equip.state}</p>
                  <p><span className="font-medium">Centro de Custo:</span> {equip.costCenter}</p>
                  <p><span className="font-medium">Observações:</span> {equip.obs}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Relatório</h4>
            <p className="mt-2">{supervisor.report}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
