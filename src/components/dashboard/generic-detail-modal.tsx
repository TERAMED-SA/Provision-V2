import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, User, Info } from "lucide-react";

interface WorkerInformation {
  name: string;
  employeeNumber: string;
  state: string;
  obs?: string;
}

interface Equipment {
  name: string;
  serialNumber: string;
  state: string;
}

// Dados específicos para ocorrência
interface OccurrenceData {
  _id: string;
  createdAt: string;
  createdAtTime: string;
  supervisorName?: string;
  siteName: string;
  details?: string;
  priority: string;
  workerInformation?: WorkerInformation[];
  equipment?: Equipment[];
}

// Dados específicos para supervisão
interface SupervisionData {
  _id: string;
  createdAt: string;
  createdAtTime: string;
  supervisorName: string;
  siteName: string;
  costCenter: string;
  details?: string;
  workerInformation?: WorkerInformation[];
  equipment?: Equipment[];
}

type NotificationData = OccurrenceData | SupervisionData;

interface GenericDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type: "occurrence" | "supervision";
  footerContent?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  // Props específicas para ocorrência
  occurrenceData?: OccurrenceData;
  getPriorityLabel?: (priority: string) => string;
  priorityColor?: string;
  // Props específicas para supervisão
  supervisionData?: SupervisionData;
}

export function GenericDetailModal({
  isOpen,
  onClose,
  title,
  description,
  type,
  footerContent,
  icon: Icon,
  className,
  // Props específicas para ocorrência
  occurrenceData,
  getPriorityLabel,
  priorityColor,
  // Props específicas para supervisão
  supervisionData,
}: GenericDetailModalProps) {
  const isOccurrence = type === "occurrence";
  const defaultIcon = isOccurrence ? AlertTriangle : Shield;
  const DisplayIcon = Icon || defaultIcon;

  // Seleciona os dados baseado no tipo
  const notification = isOccurrence ? occurrenceData : supervisionData;

  if (!notification) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 max-h-[95vh] flex flex-col w-full max-w-[95vw] lg:max-w-md  xl:max-w-xl",
          className
        )}
      >
        <DialogHeader className="p-4 lg:p-6 pb-3 lg:pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 lg:gap-3 text-base lg:text-lg font-semibold">
              <DisplayIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              <span className="truncate">{title}</span>
            </DialogTitle>
          </div>
          {description && (
            <p className="text-xs lg:text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </DialogHeader>

        <div className="px-4 lg:px-6 py-2 overflow-y-auto flex-grow bg-muted/10 dark:bg-muted/20">
          <div className="space-y-1 ">
            {/* Header Information - Data, Supervisor, Prioridade/Cost Center em linha, Site embaixo */}
            <div className="p-3 lg:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                    Data
                  </p>
                  <p className="text-xs lg:text-sm">
                    {notification.createdAt} {notification.createdAtTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                    Supervisor
                  </p>
                  <p className="text-xs lg:text-sm">
                    {notification.supervisorName || "Não atribuído"}
                  </p>
                </div>
                <div>
                  {isOccurrence && occurrenceData?.priority && (
                    <>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                        Prioridade
                      </p>
                      <Badge className={cn("text-xs", priorityColor)}>
                        {getPriorityLabel
                          ? getPriorityLabel(occurrenceData.priority)
                          : occurrenceData.priority}
                      </Badge>
                    </>
                  )}
                  {!isOccurrence && supervisionData?.costCenter && (
                    <>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                        Centro de Custo
                      </p>
                      <p className="text-xs lg:text-sm font-medium">
                        {supervisionData.costCenter}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                  Site
                </p>
                <p className="text-sm font-medium break-words">
                  {notification.siteName}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="p-3 lg:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-2">
                Detalhes
              </p>
              <p className="text-xs lg:text-sm whitespace-pre-line break-words">
                {notification.details || "Sem dados."}
              </p>
            </div>

            {/* Tabs for Workers and Equipment */}
            <Tabs defaultValue="workers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="workers" className="text-xs lg:text-sm">
                  Trabalhadores
                </TabsTrigger>
                <TabsTrigger value="equipment" className="text-xs lg:text-sm">
                  Equipamentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workers" className="mt-3 lg:mt-4">
                {notification.workerInformation &&
                notification.workerInformation.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 lg:gap-3">
                    {notification.workerInformation.map((worker, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                            <h4 className="text-xs lg:text-sm font-medium truncate">
                              {worker.name}
                            </h4>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            Nº {worker.employeeNumber}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              Estado
                            </p>
                            <p className="text-xs lg:text-sm break-words">
                              {worker.state}
                            </p>
                          </div>
                          {worker.obs && (
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                Observações
                              </p>
                              <p className="text-xs break-words">
                                {worker.obs}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 lg:py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Info className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2" />
                    <p className="text-xs lg:text-sm">
                      Nenhum trabalhador registado nesta{" "}
                      {isOccurrence ? "ocorrência" : "supervisão"}.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="equipment" className="mt-3 lg:mt-4">
                {notification.equipment && notification.equipment.length > 0 ? (
                  <div className="w-full max-h-[250px] lg:max-h-[300px] overflow-y-auto border rounded-sm">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 whitespace-nowrap w-auto">
                            Equipamento
                          </TableHead>
                          <TableHead className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 whitespace-nowrap w-auto">
                            Nº de Série
                          </TableHead>
                          <TableHead className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 bg-gray-50 dark:bg-gray-800/50 whitespace-nowrap w-auto">
                            Estado
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notification.equipment.map((equip, index) => (
                          <TableRow key={index}>
                            <TableCell className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 dark:bg-gray-800/50 whitespace-nowrap w-auto">
                              {equip.name}
                            </TableCell>
                            <TableCell className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 dark:bg-gray-800/50 whitespace-nowrap w-auto">
                              {equip.serialNumber}
                            </TableCell>
                            <TableCell className="py-0 px-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 dark:bg-gray-800/50 whitespace-nowrap w-auto">
                              {equip.state}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 lg:py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Info className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2" />
                    <p className="text-xs lg:text-sm">
                      Nenhum equipamento registado nesta{" "}
                      {isOccurrence ? "ocorrência" : "supervisão"}.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {footerContent && (
          <DialogFooter className="p-4 lg:p-6 pt-3 lg:pt-4 mt-auto bg-muted/50">
            {footerContent}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
