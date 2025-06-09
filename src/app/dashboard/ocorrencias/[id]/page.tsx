"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Calendar, Clock, Building, User, AlertTriangle, Package, Info } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BreadcrumbRoutas } from "@/src/components/ulils/breadcrumbRoutas"
import { OccurrencePDF } from "@/src/components/dashboard/pdf/occurrence-pdf"
import { Separator } from "@/src/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import toast from "react-hot-toast"
import { Badge } from "@/src/components/ui/badge"
import instance from "@/src/lib/api"
import { Skeleton } from "@/src/components/ui/skeleton"
import { getPriorityLabel } from "@/src/components/dashboard/data-table/occurrence"

type Notification = {
  _id: string
  idNotification?: string
  createdAt: string
  createdAtTime: string
  createdAtDate: Date
  siteName: string
  costCenter: string
  supervisorName: string
  priority: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"
  details: string
  numberOfWorkers?: number
  workerInformation?: WorkerInfo[]
  equipment?: Equipment[]
}

type WorkerInfo = {
  name: string
  employeeNumber: string
  state: string
  obs?: string
}

type Equipment = {
  name: string
  serialNumber: string
  state: string
  costCenter: string
  obs?: string
}

export default function OccurrenceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOccurrenceDetails = async () => {
      if (!params.id) return
      setLoading(true)
      try {
        const response = await instance.get(`/occurrence/${params.id}`)
        const data = response.data.data
        const formattedNotification = {
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : '',
          createdAtTime: data.createdAt ? new Date(data.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
          createdAtDate: data.createdAt ? new Date(data.createdAt) : new Date(),
        }
        
        setNotification(formattedNotification)
      } catch (error) {
        console.error("Erro ao buscar detalhes da ocorrência:", error)
        toast.error("Erro ao carregar os detalhes da ocorrência")
      } finally {
        setLoading(false)
      }
    }

    fetchOccurrenceDetails()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center gap-2 mb-6">
          <BreadcrumbRoutas title="Detalhes da Ocorrência" productName="Ocorrências" showBackButton />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!notification) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold">Ocorrência não encontrada</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Info className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-center">A ocorrência solicitada não foi encontrada ou não está disponível.</p>
              <Button className="mt-4" onClick={() => router.back()}>
                Voltar para ocorrências
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const priorityColors = {
    BAIXA: "bg-green-100 text-green-800 border-green-200",
    MEDIA: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ALTA: "bg-orange-100 text-orange-800 border-orange-200",
    CRITICA: "bg-red-100 text-red-800 border-red-200",
  }

  const priorityColor = priorityColors[notification.priority] || "bg-gray-100 text-gray-800 border-gray-200"
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
      <BreadcrumbRoutas title="Detalhes da Ocorrência" productName="Ocorrências" showBackButton />
    
        </div>

        <PDFDownloadLink
          document={<OccurrencePDF notification={notification} getPriorityLabel={getPriorityLabel} />}
          fileName={`ocorrencia-${notification.siteName}-${notification._id}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ loading: pdfLoading }) => (
            <Button variant="outline" disabled={pdfLoading}>
              <FileText className="h-4 w-4 mr-2" /> Baixar PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className={priorityColor}>
                  {getPriorityLabel(notification.priority)}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {notification.createdAt}
                  <Clock className="h-4 w-4 ml-2" />
                  {notification.createdAtTime}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Local</p>
                  <p className="font-medium">{notification.siteName}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Centro de Custo</p>
                  <p>{notification.costCenter}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                  <p>{notification.supervisorName || "Não informado"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número de Trabalhadores</p>
                  <p>{notification.numberOfWorkers || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Detalhes da Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="workers">Trabalhadores</TabsTrigger>
                <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-line">{notification.details || "Sem detalhes disponíveis."}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workers" className="mt-0">
                {notification.workerInformation && notification.workerInformation.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notification.workerInformation.map((worker, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" /> {worker.name}
                          </CardTitle>
                          <CardDescription>Nº {worker.employeeNumber}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Estado</p>
                              <p>{worker.state}</p>
                            </div>

                            {worker.obs && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                                <p>{worker.obs}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center py-8">
                      <p className="text-muted-foreground">Nenhum trabalhador registrado nesta ocorrência.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="equipment" className="mt-0">
                {notification.equipment && notification.equipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notification.equipment.map((equip, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4" /> {equip.name}
                          </CardTitle>
                          <CardDescription>Nº Série: {equip.serialNumber}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Estado</p>
                              <p>{equip.state}</p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Centro de Custo</p>
                              <p>{equip.costCenter}</p>
                            </div>

                            {equip.obs && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                                <p>{equip.obs}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center py-8">
                      <p className="text-muted-foreground">Nenhum equipamento registrado nesta ocorrência.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground border-t pt-4">
            Visualização da ocorrência
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}