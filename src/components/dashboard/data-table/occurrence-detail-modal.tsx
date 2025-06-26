import * as React from "react";
import { User, AlertTriangle, Info, Download, Loader2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { getPriorityLabel } from "./occurrence";
import { Occurrence } from "@/features/application/domain/entities/Occurrence";
import { Button } from "../../ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OccurrencePDF } from "../pdf/occurrence-pdf";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GenericDetailModal } from "../generic-detail-modal";

interface OccurrenceDetailModalProps {
  notification: Occurrence | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OccurrenceDetailModal({ notification, isOpen, onClose }: OccurrenceDetailModalProps) {
  if (!notification) return null;

  const priorityColors = {
    BAIXA: "bg-green-100 text-green-800 border-green-200",
    MEDIA: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ALTA: "bg-orange-100 text-orange-800 border-orange-200",
    CRITICA: "bg-red-100 text-red-800 border-red-200",
  };

  const priorityColor = priorityColors[notification.priority] || "bg-gray-100 text-gray-800 border-gray-200";

  const footer = (
    <PDFDownloadLink
      document={<OccurrencePDF notification={notification} getPriorityLabel={getPriorityLabel} />}
      fileName={`ocorrencia-${notification.siteName}-${notification._id}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading: pdfLoading }) => (
        <Button variant="outline" disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Baixar PDF
        </Button>
      )}
    </PDFDownloadLink>
  );

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Ocorrência"
      icon={AlertTriangle}
      footerContent={footer}
    >
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Data</p>
          <p>{(notification as any).createdAt} {(notification as any).createdAtTime}</p>
        </div>
 
        <div>
          <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
          <p>{notification.supervisorName || 'Não atribuído'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
          <Badge className={priorityColor}>
            {getPriorityLabel(notification.priority)}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-sm font-medium text-muted-foreground">Site</p>
        <p className="font-medium">{notification.siteName}</p>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-sm font-medium text-muted-foreground mb-2">Detalhes</p>
        <p className="whitespace-pre-line">{notification.details || "Sem detalhes disponíveis."}</p>
      </div>

      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workers">Trabalhadores</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="mt-4">
          {notification.workerInformation && notification.workerInformation.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {notification.workerInformation.map((worker, index) => (
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
              <p>Nenhum trabalhador registado nesta ocorrência.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          {notification.equipment && notification.equipment.length > 0 ? (
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
                  {notification.equipment.map((equip, index) => (
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
    </GenericDetailModal>
  );
} 