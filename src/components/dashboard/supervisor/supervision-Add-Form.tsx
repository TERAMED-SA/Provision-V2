"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import instance from "@/lib/api"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"

interface SupervisorAddFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const supervisorSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().min(1, "Telefone obrigatório"),
  gender: z.string().min(1, "Gênero obrigatório"),
  employeeId: z.string().min(1, "Matrícula obrigatória"),
  address: z.string().optional(),
  mecCoordinator: z.string().min(1, '"mecCoordinator" is required'),
  password: z.string().min(1, '"password" is required'),
})

type SupervisorForm = z.infer<typeof supervisorSchema>

export function SupervisorAddForm({ 
  open, 
  onOpenChange,
  onSuccess
}: SupervisorAddFormProps) {
  const t = useTranslations("supervisors")
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<SupervisorForm>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      gender: "",
      employeeId: "",
      address: "",
      mecCoordinator: user?._id || "",
      password: ""
    }
  })

  React.useEffect(() => {
    if (open) {
      reset({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "",
        employeeId: "",
        address: "",
        mecCoordinator: user?._id || "",
        password: ""
      })
    }
  }, [open, reset])

  React.useEffect(() => {
    if (user?._id) {
      setValue("mecCoordinator", user._id)
    }
  }, [user?._id, setValue])

  const onSubmit = async (data: SupervisorForm) => {
    setIsSubmitting(true)
    try {
      await instance.post(
        `/userAuth/signUp`,
        {
          ...data,
        }
      )
      toast.success(t("addSuccess"))
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      let backendMsg = error?.response?.data?.message || ""
      if (backendMsg.includes('"mecCoordinator" is required')) {
        toast.error('Erro de validação: o campo de identificação do coordenador é obrigatório.')
      } else if (backendMsg.includes('"password" is required')) {
        toast.error('Erro de validação: o campo senha é obrigatório.')
      } else if (Object.keys(errors).length > 0) {
        if (errors.mecCoordinator) {
          toast.error('Erro de validação: o campo de identificação do coordenador é obrigatório.')
        } else if (errors.password) {
          toast.error('Erro de validação: o campo senha é obrigatório.')
        } else {
          toast.error('Um dos campos obrigatórios não foi preenchido corretamente.')
        }
      } else {
        toast.error(backendMsg || 'Um erro inesperado ocorreu.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {user?._id && (
          <div className="mb-2 p-2 rounded bg-blue-50 text-blue-900 text-xs font-mono border border-blue-200">
            <span className="font-semibold">ID do coordenador:</span> {user._id}
          </div>
        )}
        <DialogHeader>
          <DialogTitle>{t("addTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("form.namePlaceholder")}
              className="w-full"
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t("form.email")}</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t("form.emailPlaceholder")}
              className="w-full"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="employeeId">{t("form.employeeId")}</Label>
            <Input
              id="employeeId"
              type="number"
              {...register("employeeId")}
              placeholder={t("form.employeeIdPlaceholder")}
              className="max-w-xs"
            />
            {errors.employeeId && <span className="text-red-500 text-xs">{errors.employeeId.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">{t("form.phoneNumber")}</Label>
            <Input
              id="phoneNumber"
              type="number"
              {...register("phoneNumber")}
              placeholder={t("form.phoneNumberPlaceholder")}
              className="max-w-xs"
            />
            {errors.phoneNumber && <span className="text-red-500 text-xs">{errors.phoneNumber.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">{t("form.address")}</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder={t("form.addressPlaceholder")}
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">{t("form.gender")}</Label>
            <Select
              value={undefined}
              onValueChange={val => setValue("gender", val, { shouldValidate: true })}
            >
              <SelectTrigger className="max-w-xs w-full">
                <SelectValue placeholder={t("form.genderPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t("form.male")}</SelectItem>
                <SelectItem value="Female">{t("form.female")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message}</span>}
          </div>
          <input type="hidden" {...register("mecCoordinator")}/>
          <div className="md:col-span-2 flex flex-col items-end gap-2 pt-4">
        
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="dark:bg-gray-900 dark:text-gray-100"
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="dark:bg-blue-700 dark:text-white cursor-pointer">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    {t("adding")}
                  </>
                ) : (
                  t("add")
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}