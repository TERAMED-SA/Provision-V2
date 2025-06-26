"use client"

import * as React from "react"
import { Shield, AlertTriangle, Info, Download, Loader2, User } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Button } from "../../ui/button"
import { GenericDetailModal } from "../generic-detail-modal"
import { OccurrencePDF } from "../pdf/occurrence-pdf"
import { GenericPDF } from "../pdf/generic-pdf"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ActivityDetailModalProps {
  type: "supervision" | "occurrence"
  data: any
  isOpen: boolean
  onClose: () => void
}

function formatDateTime(dateValue: any) {
  if (!dateValue) return '';
  // Se já vier como Date
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return `${dateValue.toLocaleTimeString()} ${dateValue.toLocaleDateString()}`;
  }
  // Se vier como string ISO ou timestamp
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
  }
  // Se for string já formatada, retorna como está
  return dateValue;
}

export function ActivityDetailModal({ type, data, isOpen, onClose }: ActivityDetailModalProps) {
  if (!isOpen || !data) return null

  // PDF para ocorrência
  const occurrenceFooter = (
    <PDFDownloadLink
      document={<OccurrencePDF notification={data} getPriorityLabel={(p: string) => p} />}
      fileName={`ocorrencia-${data.siteName}-${data._id}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {() => (
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
      )}
    </PDFDownloadLink>
  )

  // PDF para supervisão
  const supervisionFooter = (
    <PDFDownloadLink
      document={
        <GenericPDF
          title="Detalhes da Supervisão"
          sections={[
            {
              title: "Informações da Supervisão",
              fields: [
                { label: "Supervisor", value: data.supervisorName || data.name || "N/A" },
                { label: "Site", value: data.siteName || "N/A" },
                { label: "Data", value: formatDateTime(data.createdAt) },
                { label: "Centro de Custo", value: data.costCenter || "N/A" },
              ],
            },
            data.report
              ? {
                  title: "Relatório",
                  fields: [{ label: "Relatório", value: data.report }],
                }
              : null,
            data.equipment && data.equipment.length > 0
              ? {
                  title: "Equipamentos",
                  fields: data.equipment.map((equip: any, idx: number) => ({
                    label: `Equipamento ${idx + 1}`,
                    value: `${equip.name || "N/A"} (Nº Série: ${equip.serialNumber || "N/A"})`,
                  })),
                }
              : null,
          ].filter(Boolean) as any}
        />
      }
      fileName={`supervisao-${data.siteName || data.supervisorName}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {() => (
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
      )}
    </PDFDownloadLink>
  )

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "supervision" ? "Detalhes da Supervisão" : "Detalhes da Ocorrência"}
      icon={type === "supervision" ? Shield : AlertTriangle}
      footerContent={type === "supervision" ? supervisionFooter : occurrenceFooter}
    >
      <div className="space-y-4">
        {/* Header info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Data</p>
            <p>{formatDateTime(data.createdAt)}</p>
          </div>
          {type === "supervision" && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Centro de Custo</p>
              <p className="font-medium">{data.costCenter || "N/A"}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
            <p>{data.supervisorName || data.name || "N/A"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground">Site</p>
          <p className="font-medium">{data.siteName || "N/A"}</p>
        </div>

        {/* Detalhes/Relatório */}
        {type === "supervision" ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2">Detalhes</p>
            <p className="whitespace-pre-line">{data.details || data.report || "Sem Detalhes."}</p>
          </div>
        ) : (
          <>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">Detalhes</p>
              <p className="whitespace-pre-line">{data.details || "Sem detalhes disponíveis."}</p>
            </div>
            <Tabs defaultValue="workers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="workers">Trabalhadores</TabsTrigger>
                <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
              </TabsList>
              <TabsContent value="workers" className="mt-4">
                {data.workerInformation && data.workerInformation.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {data.workerInformation.map((worker: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <h4 className="font-medium">{worker.name}</h4>
                          </div>
                          <span className="text-sm text-muted-foreground">Nº {worker.employeeNumber}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Estado</p>
                            <p>{worker.state}</p>
                          </div>
                          {worker.obs && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Observações</p>
                              <p className="text-sm">{worker.obs}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Info className="h-6 w-6 mx-auto mb-2" />
                    <p>Nenhum trabalhador registrado nesta ocorrência.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="equipment" className="mt-4">
                {data.equipment && data.equipment.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto border rounded-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="p-1">Equipamento</TableHead>
                          <TableHead className="p-1">Nº de Série</TableHead>
                          <TableHead className="p-1">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.equipment.map((equip: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="p-1">{equip.name}</TableCell>
                            <TableCell className="py-1">{equip.serialNumber}</TableCell>
                            <TableCell className="py-1">{equip.state}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Info className="h-6 w-6 mx-auto mb-2" />
                    <p>Nenhum equipamento registado nesta ocorrência.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </GenericDetailModal>
  )
} 