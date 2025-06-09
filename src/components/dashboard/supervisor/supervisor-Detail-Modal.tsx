"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Globe, Mail, MapPin, Phone, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Dialog, DialogContent, DialogHeader } from "../../ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Card, CardContent, CardDescription } from "../../ui/card"
import { Badge } from "../../ui/badge"

interface Site {
  id?: string
  name?: string
}

interface Supervisor {
  name: string
  email?: string
  phoneNumber?: string
  avatar?: string
  address?: string
  mecCoordinator?: string
  createdAt?: string | Date
  sites?: Site[]
}

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
          <Avatar className="h-24 w-24 mb-2">
            <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
            {!supervisor.avatar && supervisor.name ? (
              <AvatarFallback className="flex items-center justify-center bg-black text-white rounded-full text-lg font-semibold">
                {supervisor.name.split(" ").slice(0, 1).join("")[0]?.toUpperCase()}
                {supervisor.name.split(" ").length > 1 &&
                  supervisor.name.split(" ").slice(-1).join("")[0]?.toUpperCase()}
              </AvatarFallback>
            ) : (
              <AvatarFallback className="bg-blue-600 text-white">
                {supervisor.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <h3 className="text-xl font-bold">{supervisor.name}</h3>
        </div>

        <Card className="border-0 shadow-none ">
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <div>
                  <CardDescription className="text-sm  text-gray-500">Telefone</CardDescription>
                  <p className="text-xs font-medium">{supervisor.phoneNumber || "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <div>
                  <CardDescription className="text-sm text-gray-500">Email</CardDescription>
                  <p className="text-xs font-medium">{supervisor.email || "Não informado"}</p>
                </div>
              </div>

              {supervisor.mecCoordinator && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-600" />
                  <div>
                    <CardDescription className="text-sm text-gray-500">Coordenador MEC</CardDescription>
                    <p className="text-xs font-medium">{supervisor.mecCoordinator}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <div>
                  <CardDescription className="text-sm text-gray-500">Sites Atrelados</CardDescription>
                  <div>
                    {supervisor.sites && supervisor.sites.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium">{supervisor.sites.length} sites</p>
                        <div className="mt-1 max-h-24 overflow-y-auto text-xs">
                          {supervisor.sites.map((site, index) => (
                            <Badge 
                              key={site.id || index} 
                              variant="outline" 
                              className="mr-1 mb-1 bg-teal-50 text-teal-700 border-teal-200"
                            >
                              {site.name || `Site ${index + 1}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-medium">Nenhum site atrelado</p>
                    )}
                  </div>
                </div>
              </div>

              {supervisor.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <div>
                    <CardDescription className="text-sm text-gray-500">Endereço</CardDescription>
                    <p className="text-xs font-medium">{supervisor.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <CardDescription className="text-sm text-gray-500">Cadastrado em</CardDescription>
                  <p className="text-xs font-medium">{formattedCreatedAt}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
