"use client"

import * as React from "react"
import { Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Supervisor } from "@/features/application/domain/entities/Supervisor"

interface SupervisorEditFormProps {
  supervisor: Supervisor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (supervisor: Supervisor) => Promise<void>
}

export function SupervisorEditForm({ 
  supervisor, 
  open, 
  onOpenChange,
  onSave
}: SupervisorEditFormProps) {
  const [editedSupervisor, setEditedSupervisor] = React.useState<Supervisor | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (supervisor) {
      setEditedSupervisor({ ...supervisor })
    } else {
      setEditedSupervisor(null)
    }
  }, [supervisor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedSupervisor) return
    
    const { name, value } = e.target
    setEditedSupervisor(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editedSupervisor) return
    
    setIsSubmitting(true)
    try {
      await onSave(editedSupervisor)
      toast.success("Supervisor atualizado com sucesso")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar supervisor")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!editedSupervisor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Supervisor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="name">Nome</label>
              <Input
                id="name"
                name="name"
                value={editedSupervisor.name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="supervisorCode">Telefone</label>
              <Input
                id="supervisorCode"
                name="supervisorCode"
                value={editedSupervisor.phoneNumber || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                value={editedSupervisor.email || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address">Endereço</label>
              <Input
                id="address"
                name="address"
                value={editedSupervisor.address || ""}
                onChange={handleChange}
                required
              />
            </div>
          
            <div className="flex justify-end gap-2 pt-4 col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
