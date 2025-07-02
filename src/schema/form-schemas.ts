import { z } from "zod"

// Mensagens de erro
export const errorMessages = {
  required: (campo: string) => `O campo ${campo} é obrigatório`,
  minSelection: "Selecione pelo menos uma opção",
}

// Schema para Step 1
export const step1Schema = z.object({
  codigo: z.string().min(1, errorMessages.required("Código")),
  designacao: z.string().min(1, errorMessages.required("Designação")),
  morada: z.string().min(1, errorMessages.required("Morada")),
})

// Schema para Step 2
export const step2Schema = z.object({
  tipos: z.array(z.enum(["site", "posicao", "rsu"])).min(1, errorMessages.minSelection),
  zona_site: z.string().optional(),
  supervisor_site: z.string().optional(),
  aria: z.string().optional(),
  zona_posicao: z.string().optional(),
  setor: z.string().optional(),
  supervisor_posicao: z.string().optional(),
  tipos_baldes: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.tipos.includes("site")) {
    if (!data.zona_site?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.required("Zona"),
        path: ["zona_site"],
      })
    }
    if (!data.supervisor_site?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.required("Supervisor"),
        path: ["supervisor_site"],
      })
    }
  }

  if (data.tipos.includes("posicao")) {
    if (!data.aria?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.required("Área"),
        path: ["aria"],
      })
    }
    if (!data.zona_posicao?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.required("Zona"),
        path: ["zona_posicao"],
      })
    }
    if (!data.setor?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.required("Setor"),
        path: ["setor"],
      })
    }
    if (!data.supervisor_posicao?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.required("Supervisor"),
        path: ["supervisor_posicao"],
      })
    }
  }
})

// Schema para Step 3
export const step3Schema = z.object({
  quantidade_tl: z.string().optional(),
  adicionar_manualmente: z.boolean().optional(),
  tl_detalhes: z
    .array(
      z.object({
        numero_mecanografico: z.string().min(1, "Número mecanográfico é obrigatório"),
        nome: z.string().min(1, "Nome é obrigatório"),
      })
    )
    .optional(),
  supervisor_final: z.string().optional(),
  coordenadas: z.string().optional(),
})

// Schema completo
export const formSchema = z.intersection(
  z.intersection(step1Schema, step2Schema),
  step3Schema
)

export type FormData = z.infer<typeof formSchema>

// Opções para tipos de baldes
export const tiposBaldesToptions = [
  "Contentor de Papel",
  "Contentor de Plástico",
  "Contentor de Vidro",
  "Contentor Orgânico",
  "Contentor Indiferenciado",
]
