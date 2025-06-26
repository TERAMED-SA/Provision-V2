"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import type { Supervisor } from "@/features/application/domain/entities/Supervisor"
import { Loader2 } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Download } from "lucide-react"
import { Button } from "../../ui/button"
import { GenericPDF } from "../pdf/generic-pdf"
import { GenericDetailModal } from "../generic-detail-modal"

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

  const footer = supervisor ? (
    <PDFDownloadLink
      document={
        <GenericPDF
          title="Detalhes do Supervisor"
          sections={[
            {
              title: "Informações Básicas",
              fields: [
                { label: "Nome", value: supervisor.name || "N/A" },
                { label: "Código", value: supervisor.employeeId || "N/A" },
                { label: "Email", value: supervisor.email || "N/A" },
                { label: "Telefone", value: supervisor.phoneNumber || "N/A" },
              ],
            },
            supervisor.equipment && supervisor.equipment.length > 0
              ? {
                  title: "Equipamentos",
                  fields: supervisor.equipment.map((equip, idx) => ({
                    label: `Equipamento ${idx + 1}`,
                    value: `${equip.name || "N/A"} (Nº Série: ${equip.serialNumber || "N/A"})`,
                  })),
                }
              : null,
            supervisor.report
              ? {
                  title: "Relatório",
                  fields: [
                    { label: "Relatório", value: supervisor.report },
                  ],
                }
              : null,
          ].filter(Boolean) as any}
        />
      }
      fileName={`supervisor-${supervisor.name || supervisor.employeeId}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Baixar PDF
        </Button>
      )}
    </PDFDownloadLink>
  ) : null

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Detalhes do Supervisor"
      footerContent={footer}
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      ) : supervisor ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
         
              
              <span className="text-lg text-muted-foreground flex gap-2 items-center">{supervisor.employeeId || "N/A"} - 
                <h3 className="text-xl font-semibold">{supervisor.name}</h3>
              </span>
       
          </div>

          <div className="grid gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
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
    </GenericDetailModal>
  )
}
