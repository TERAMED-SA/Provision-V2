import React from 'react'
import { Download,FileText, Wrench, Users, Badge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { OccurrencePDF } from './pdf/occurrence-pdf'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '../ui/button'

interface DetailModalProps {
  notification: Notification | null
  isOpen: boolean
  onClose: () => void
}

export function DetailModal({ notification, isOpen, onClose }: DetailModalProps) {
  if (!notification) return null

  const getWorkerStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'presente':
        return 'bg-green-100 text-green-800'
      case 'falta justificada':
        return 'bg-yellow-100 text-yellow-800'
      case 'falta injustificada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEquipmentStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'operacional':
        return 'bg-green-100 text-green-800'
      case 'inoperante':
      case 'em manutenção':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'baixa':
        return 'bg-blue-100 text-blue-800'
      case 'media':
        return 'bg-yellow-100 text-yellow-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'critica':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Detalhes da Supervisão
          </DialogTitle>
          <div className="flex items-center gap-2">
            <PDFDownloadLink
              document={<OccurrencePDF notification={notification} />}
              fileName={`supervisao-${notification.siteName}-${notification._id}.pdf`}
              style={{ textDecoration: "none" }}
            >
              {({ loading: pdfLoading }: { loading: boolean }) => (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-900 hover:bg-blue-50" 
                  disabled={pdfLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {pdfLoading ? 'Gerando...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data</label>
                  <p className="text-sm font-semibold">{notification.createdAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hora</label>
                  <p className="text-sm font-semibold">{notification.createdAtTime}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Site</label>
                <p className="text-sm font-semibold">{notification.siteName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Supervisor</label>
                <p className="text-sm font-semibold">{notification.supervisorName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Centro de Custo</label>
                <p className="text-sm font-semibold">{notification.costCenter}</p>
              </div>
              
              {notification.coordinates && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Coordenadas</label>
                  <p className="text-sm font-semibold">{notification.coordinates}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Duração</label>
                <p className="text-sm font-semibold">{notification.time || notification.duration || 'N/A'}</p>
              </div>
              
              {notification.priority && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Prioridade</label>
                  <Badge className={getPriorityColor(notification.priority)}>
                    {notification.priority}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Relatório */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {notification.report || notification.details || 'Nenhum relatório disponível'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações dos Trabalhadores */}
        {notification.workerInformation && notification.workerInformation.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Trabalhadores ({notification.workerInformation.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notification.workerInformation.map((worker, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{worker.name}</h4>
                      <Badge className={getWorkerStateColor(worker.state)}>
                        {worker.state}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Nº Funcionário:</span> {worker.employeeNumber}</p>
                      {worker.obs && (
                        <p><span className="font-medium">Observações:</span> {worker.obs}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações dos Equipamentos */}
        {notification.equipment && notification.equipment.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Equipamentos ({notification.equipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notification.equipment.map((equipment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{equipment.name}</h4>
                      <Badge className={getEquipmentStateColor(equipment.state)}>
                        {equipment.state}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Nº Série:</span> {equipment.serialNumber}</p>
                      <p><span className="font-medium">Centro de Custo:</span> {equipment.costCenter}</p>
                      {equipment.obs && (
                        <p><span className="font-medium">Observações:</span> {equipment.obs}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas Resumidas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {notification.workerInformation?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Total Trabalhadores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {notification.workerInformation?.filter(w => 
                    w.state === 'Falta justificada' || w.state === 'Falta injustificada'
                  ).length || 0}
                </div>
                <div className="text-sm text-gray-500">Trabalhadores Ausentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {notification.equipment?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Total Equipamentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {notification.equipment?.filter(e => 
                    e.state === 'Inoperante' || e.state === 'Em manutenção'
                  ).length || 0}
                </div>
                <div className="text-sm text-gray-500">Equipamentos Inoperantes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}