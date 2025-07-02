"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  MapPin,
  Building,
  Users,
  Trash2,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast, { Toaster } from "react-hot-toast"

// Mensagens de erro em português
const mensagensErro = {
  required: (campo: string) => `O campo ${campo} é obrigatório`,
  min: (campo: string, min: number) => `${campo} deve ter pelo menos ${min} caracteres`,
  select: "Selecione uma opção",
}

// Schema para Step 1 - Informações Básicas
const step1Schema = z.object({
  codigo: z.string().min(1, mensagensErro.required("Código")).min(2, mensagensErro.min("Código", 2)),
  designacao: z.string().min(1, mensagensErro.required("Designação")).min(3, mensagensErro.min("Designação", 3)),
  morada: z.string().min(1, mensagensErro.required("Morada")).min(5, mensagensErro.min("Morada", 5)),
})

// Schema para Step 2 - Tipo e Configurações
const step2Schema = z
  .object({
    tipo: z.enum(["site", "posicao", "rsu"], {
      required_error: mensagensErro.select,
      invalid_type_error: mensagensErro.select,
    }),
    // Campos condicionais para site
    zona_site: z.string().optional(),
    supervisor_site: z.string().optional(),
    // Campos condicionais para posição
    area: z.string().optional(),
    zona_posicao: z.string().optional(),
    setor: z.string().optional(),
    supervisor_posicao: z.string().optional(),
    // Campos condicionais para RSU
    tipos_baldes: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "site") {
      if (!data.zona_site || data.zona_site.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: mensagensErro.required("Zona"),
          path: ["zona_site"],
        })
      }
      if (!data.supervisor_site || data.supervisor_site.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: mensagensErro.required("Supervisor"),
          path: ["supervisor_site"],
        })
      }
    }
    if (data.tipo === "posicao") {
      if (!data.area || data.area.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: mensagensErro.required("Área"),
          path: ["area"],
        })
      }
      if (!data.zona_posicao || data.zona_posicao.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: mensagensErro.required("Zona"),
          path: ["zona_posicao"],
        })
      }
      if (!data.setor || data.setor.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: mensagensErro.required("Setor"),
          path: ["setor"],
        })
      }
      if (!data.supervisor_posicao || data.supervisor_posicao.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: mensagensErro.required("Supervisor"),
          path: ["supervisor_posicao"],
        })
      }
    }
    if (data.tipo === "rsu") {
      if (!data.tipos_baldes || data.tipos_baldes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione pelo menos um tipo de balde",
          path: ["tipos_baldes"],
        })
      }
    }
  })

// Schema para Step 3 - Finalização
const step3Schema = z.object({
  quantidade_tl: z.string().optional(),
  tl_detalhes: z
    .array(
      z.object({
        numero_mecanografico: z.string().optional(),
        nome: z.string().optional(),
      }),
    )
    .optional(),
  coordenador: z.string().optional(),
})

// Schema completo
const formSchema = z.intersection(z.intersection(step1Schema, step2Schema), step3Schema)

type FormData = z.infer<typeof formSchema>

const tiposBaldesToptions = [
  "Contentor de Papel",
  "Contentor de Plástico",
  "Contentor de Vidro",
  "Contentor Orgânico",
  "Contentor Indiferenciado",
]

const tiposConfig = [
  {
    value: "site",
    label: "Site",
    icon: Building,
  },
  {
    value: "posicao",
    label: "Posição",
    icon: MapPin,
  },
  {
    value: "rsu",
    label: "RSU",
    icon: Trash2,
  },
]

interface MultiStepFormProps {
  codigoSite: string
  nomeSite: string
}

export default function MultiStepForm({ codigoSite, nomeSite }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTipo, setSelectedTipo] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMoreTl, setShowMoreTl] = useState(false)
  const [tlCount, setTlCount] = useState<number>(0)
  // Novo estado para controle do checkbox de adicionar manualmente TL
  const [adicionarTlManual, setAdicionarTlManual] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      tipos_baldes: [],
      tl_detalhes: [],
    },
  })

  const watchedValues = watch()

  // Atualiza a quantidade de TL dinamicamente
  const handleQuantidadeTlChange = (value: string) => {
    const n = Math.max(0, Math.min(24, Number(value) || 0))
    setValue("quantidade_tl", value)
    setTlCount(n)

    // Garante que o array tl_detalhes tenha o tamanho correto
    const currentDetails = watchedValues.tl_detalhes || []
    if (n > currentDetails.length) {
      setValue("tl_detalhes", [
        ...currentDetails,
        ...Array.from({ length: n - currentDetails.length }, () => ({
          numero_mecanografico: "",
          nome: "",
        })),
      ])
    } else if (n < currentDetails.length) {
      setValue("tl_detalhes", currentDetails.slice(0, n))
    }
    setShowMoreTl(false) // Reset view quando quantidade muda
  }

  const getTlDetailsToShow = () => {
    const details = watchedValues.tl_detalhes || []
    if (!showMoreTl) {
      return details.slice(0, 3)
    }
    return details
  }

  const hasMoreTlToShow = () => {
    const details = watchedValues.tl_detalhes || []
    return details.length > 3 && !showMoreTl
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ["codigo", "designacao", "morada"]
    } else if (currentStep === 2) {
      fieldsToValidate = ["tipo"]
      if (selectedTipo === "site") {
        fieldsToValidate.push("zona_site", "supervisor_site")
      } else if (selectedTipo === "posicao") {
        fieldsToValidate.push("area", "zona_posicao", "setor", "supervisor_posicao")
      } else if (selectedTipo === "rsu") {
        fieldsToValidate.push("tipos_baldes")
      }
    }

    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: FormData) => {
    // Só executa se estivermos no step 3 e não estivermos já enviando
    if (currentStep !== 3 || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simular envio para API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Formulário enviado com sucesso!", {
        duration: 4000,
        position: "top-center",
      })

      // Aqui você pode adicionar lógica de envio real
      console.log("Dados enviados:", data)
    } catch (error) {
      toast.error("Erro ao enviar formulário. Tente novamente.", {
        duration: 4000,
        position: "top-center",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTipoChange = (novoTipo: string) => {
    // Limpar campos do tipo anterior
    if (selectedTipo === "site") {
      setValue("zona_site", "")
      setValue("supervisor_site", "")
      clearErrors(["zona_site", "supervisor_site"])
    } else if (selectedTipo === "posicao") {
      setValue("area", "")
      setValue("zona_posicao", "")
      setValue("setor", "")
      setValue("supervisor_posicao", "")
      clearErrors(["area", "zona_posicao", "setor", "supervisor_posicao"])
    } else if (selectedTipo === "rsu") {
      setValue("tipos_baldes", [])
      clearErrors("tipos_baldes")
    }

    setValue("tipo", novoTipo as "site" | "posicao" | "rsu")
    setSelectedTipo(novoTipo)
    clearErrors("tipo")
  }

  const handleCheckboxChange = (tipo: string, currentValue: string[]) => {
    const isChecked = currentValue.includes(tipo)
    if (isChecked) {
      return currentValue.filter((v: string) => v !== tipo)
    } else {
      return [...currentValue, tipo]
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="codigo" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Building className="w-4 h-4" />
              Código *
            </Label>
            <Controller
              name="codigo"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="codigo"
                    placeholder="Digite o código"
                    className={cn(
                      "transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                      errors.codigo && "border-red-400 focus:border-red-500 focus:ring-red-200",
                    )}
                  />
                  {errors.codigo && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.codigo.message}</span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designacao" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              Designação *
            </Label>
            <Controller
              name="designacao"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="designacao"
                    placeholder="Digite a designação"
                    className={cn(
                      "transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                      errors.designacao && "border-red-400 focus:border-red-500 focus:ring-red-200",
                    )}
                  />
                  {errors.designacao && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.designacao.message}</span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="morada" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            Morada *
          </Label>
          <Controller
            name="morada"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  id="morada"
                  placeholder="Digite a morada completa"
                  className={cn(
                    "transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                    errors.morada && "border-red-400 focus:border-red-500 focus:ring-red-200",
                  )}
                />
                {errors.morada && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.morada.message}</span>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-semibold text-gray-800">Selecione o tipo *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiposConfig.map((tipo) => {
            const Icon = tipo.icon
            const isSelected = selectedTipo === tipo.value
            return (
              <div
                key={tipo.value}
                className={cn(
                  "relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-white",
                  isSelected
                    ? "border-blue-500 shadow-md  ring-blue-300"
                    : "border-gray-200 hover:border-gray-300",
                  errors.tipo && !selectedTipo && "border-red-400 bg-red-50",
                )}
                onClick={() => handleTipoChange(tipo.value)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={cn("p-3 rounded-full transition-colors", isSelected ? "bg-blue-50" : "bg-gray-50")}>
                    <Icon className={cn("w-6 h-6", isSelected ? "text-blue-600" : "text-gray-600")} />
                  </div>
                  <div className="space-y-1">
                    <div
                      className={cn(
                        "font-semibold text-sm transition-colors",
                        isSelected ? "text-blue-600" : "text-gray-700",
                      )}
                    >
                      {tipo.label}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {errors.tipo && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.tipo.message}</span>
          </div>
        )}
      </div>

      {/* Campos condicionais para Site */}
      {selectedTipo === "site" && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Configurações do Site
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zona_site" className="text-sm font-medium text-gray-700">
                Zona *
              </Label>
              <Controller
                name="zona_site"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      id="zona_site"
                      placeholder="Digite a zona"
                      className={cn(
                        "bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                        errors.zona_site && "border-red-400 focus:border-red-500 focus:ring-red-200",
                      )}
                    />
                    {errors.zona_site && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.zona_site.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor_site" className="text-sm font-medium text-gray-700">
                Supervisor *
              </Label>
              <Controller
                name="supervisor_site"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      id="supervisor_site"
                      placeholder="Digite o supervisor"
                      className={cn(
                        "bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                        errors.supervisor_site && "border-red-400 focus:border-red-500 focus:ring-red-200",
                      )}
                    />
                    {errors.supervisor_site && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.supervisor_site.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Campos condicionais para Posição */}
      {selectedTipo === "posicao" && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Configurações da Posição
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium text-gray-700">
                Área *
              </Label>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      id="area"
                      placeholder="Digite a área"
                      className={cn(
                        "bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                        errors.area && "border-red-400 focus:border-red-500 focus:ring-red-200",
                      )}
                    />
                    {errors.area && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.area.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zona_posicao" className="text-sm font-medium text-gray-700">
                Zona *
              </Label>
              <Controller
                name="zona_posicao"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      id="zona_posicao"
                      placeholder="Digite a zona"
                      className={cn(
                        "bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                        errors.zona_posicao && "border-red-400 focus:border-red-500 focus:ring-red-200",
                      )}
                    />
                    {errors.zona_posicao && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.zona_posicao.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setor" className="text-sm font-medium text-gray-700">
                Setor *
              </Label>
              <Controller
                name="setor"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      id="setor"
                      placeholder="Digite o setor"
                      className={cn(
                        "bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                        errors.setor && "border-red-400 focus:border-red-500 focus:ring-red-200",
                      )}
                    />
                    {errors.setor && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.setor.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor_posicao" className="text-sm font-medium text-gray-700">
                Supervisor *
              </Label>
              <Controller
                name="supervisor_posicao"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      id="supervisor_posicao"
                      placeholder="Digite o supervisor"
                      className={cn(
                        "bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                        errors.supervisor_posicao && "border-red-400 focus:border-red-500 focus:ring-red-200",
                      )}
                    />
                    {errors.supervisor_posicao && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.supervisor_posicao.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Campos condicionais para RSU */}
      {selectedTipo === "rsu" && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Tipos de Baldes/Contentores a Recolher *
          </h3>
          <Controller
            name="tipos_baldes"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tiposBaldesToptions.map((tipo) => {
                  const isChecked = field.value?.includes(tipo) || false
                  return (
                    <div
                      key={tipo}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                      onClick={() => {
                        const newValue = handleCheckboxChange(tipo, field.value || [])
                        field.onChange(newValue)
                      }}
                    >
                      <Checkbox checked={isChecked}  className="pointer-events-none" />
                      <Label className="text-sm cursor-pointer flex-1 pointer-events-none">{tipo}</Label>
                    </div>
                  )
                })}
              </div>
            )}
          />
          {errors.tipos_baldes && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.tipos_baldes.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6  ">
      {selectedTipo === "site" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="quantidade_tl" className="text-sm font-medium text-gray-700">
              Quantidade de TL
            </Label>
            <Controller
              name="quantidade_tl"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="quantidade_tl"
                  type="number"
                  placeholder="Digite a quantidade (máx: 24)"
                  min="0"
                  max="24"
                  onChange={(e) => handleQuantidadeTlChange(e.target.value)}
                  value={field.value || ""}
                  className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 "
                />
              )}
            />
            {/* Remove info de quantidade de TLs para configurar */}
          </div>

          {/* Só mostra o checkbox depois de digitar uma quantidade válida */}
          {tlCount > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="adicionar-tl-manualmente"
                checked={adicionarTlManual}
                onCheckedChange={(checked) => setAdicionarTlManual(!!checked)}
              />
              <Label htmlFor="adicionar-tl-manualmente" className="text-sm text-gray-700 cursor-pointer">
                Adicionar manualmente os campos de TL?
              </Label>
            </div>
          )}

          {/* Só mostra os campos se o checkbox estiver marcado e quantidade for válida */}
          {adicionarTlManual && tlCount > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm text-gray-800">Detalhes dos TL</Label>
                {tlCount > 3 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {showMoreTl ? `Mostrando todos (${tlCount})` : `Mostrando 3 de ${tlCount}`}
                  </span>
                )}
              </div>

              {/* Grid responsivo para evitar quebra de layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {getTlDetailsToShow().map((_, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">TL #{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Nº Mecanográfico</Label>
                        <Controller
                          name={`tl_detalhes.${index}.numero_mecanografico` as const}
                          control={control}
                          render={({ field }) => <Input {...field} placeholder="Ex: 12345" className="text-sm h-9" />}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Nome Completo</Label>
                        <Controller
                          name={`tl_detalhes.${index}.nome` as const}
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Ex: João Silva" className="text-sm h-9" />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreTlToShow() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMoreTl(true)}
                  className="w-full border-dashed"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver mais {tlCount - 3} TL{tlCount - 3 !== 1 ? "s" : ""}
                </Button>
              )}

              {showMoreTl && tlCount > 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMoreTl(false)}
                  className="w-full"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Ver menos
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="coordenador" className="text-sm font-medium text-gray-700">
          Coordenador
        </Label>
        <Controller
          name="coordenador"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="coordenador"
              placeholder="Digite o nome do coordenador"
              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          )}
        />
      </div>
    </div>
  )

  return (
    <>

      <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
        {/* Header com Steps */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold">Adicionar Site</span>
            <span className="text-sm text-gray-600">
              <b>{codigoSite}</b> • <b>{nomeSite}</b>
            </span>
          </div>

          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep === step
                    ? "bg-blue-500 text-white"
                    : currentStep > step
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600",
                )}
              >
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          <div className="">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t bg-white ">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="min-w-[100px] bg-transparent"
            >
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep} className="min-w-[100px]">
                Próximo
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
