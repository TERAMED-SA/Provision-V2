import * as React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "../../ui/alert-dialog";
import { User, Package, AlertTriangle, Building, Info, Download } from "lucide-react";
import { Badge } from "../../ui/badge";
import { getPriorityLabel } from "./occurrence";
import { Occurrence } from "@/features/application/domain/entities/Occurrence";
import { Button } from "../../ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OccurrencePDF } from "../pdf/occurrence-pdf";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

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

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" /> Detalhes da Ocorrência
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Local</span>
              </div>
              <p>{notification.siteName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Prioridade</span>
              </div>
              <Badge className={priorityColor}>
                {getPriorityLabel(notification.priority)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
             
              <span className="text-sm font-medium text-gray-500"> <Info className="h-4 w-4 text-gray-500" /> Detalhes</span>
            <p className="text-sm">{notification.details}</p>
            </div>
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
                  <p>Nenhum trabalhador registrado nesta ocorrência.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="equipment" className="mt-4">
              {notification.equipment && notification.equipment.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {notification.equipment.map((equip, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <h4 className="font-medium">{equip.name}</h4>
                        </div>
                        <span className="text-sm text-muted-foreground">Nº Série: {equip.serialNumber}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Estado</p>
                          <p>{equip.state}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Centro de Custo</p>
                          <p>{equip.costCenter}</p>
                        </div>
                        {equip.obs && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Observações</p>
                            <p className="text-sm">{equip.obs}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Info className="h-6 w-6 mx-auto mb-2" />
                  <p>Nenhum equipamento registrado nesta ocorrência.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <AlertDialogFooter className="flex items-center justify-between mt-4">
          <PDFDownloadLink
            document={<OccurrencePDF notification={notification} getPriorityLabel={getPriorityLabel} />}
            fileName={`ocorrencia-${notification.siteName}-${notification._id}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading: pdfLoading }) => (
              <Button variant="outline" disabled={pdfLoading}>
                <Download className="h-4 w-4 mr-2" /> Baixar PDF
              </Button>
            )}
          </PDFDownloadLink>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 