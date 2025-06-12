"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import instance from "@/lib/api"

interface SupervisorAddFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SupervisorAddForm({ 
  open, 
  onOpenChange,
  onSuccess
}: SupervisorAddFormProps) {
  const t = useTranslations("supervisors")
  const [newSupervisor, setNewSupervisor] = React.useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "Male",
    employeeId: "",
    address: ""
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setNewSupervisor({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "Male",
        employeeId: "",
        address: ""
      })
    }
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSupervisor(prev => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value: string) => {
    setNewSupervisor(prev => ({ ...prev, gender: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const user = useAuth()
      await instance.post(
        `/userAuth/signUp?roler=3`,
        {
          name: newSupervisor.name,
          email: newSupervisor.email,
          phoneNumber: newSupervisor.phoneNumber,
          gender: newSupervisor.gender,
          employeeId: newSupervisor.employeeId,
          password: "12345678", 
          codeEstablishment: "LA",
          admissionDate: "2000-01-01",
          situation: "efectivo",
          departmentCode: "0009999",
          mecCoordinator: user?._id,
          address: newSupervisor.address
        }
      )
      toast.success(t("addSuccess"))
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error(t("addError"), error)
      toast.error(t("addError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("addTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              name="name"
              value={newSupervisor.name}
              onChange={handleChange}
              placeholder={t("form.namePlaceholder")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t("form.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={newSupervisor.email}
              onChange={handleChange}
              placeholder={t("form.emailPlaceholder")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="employeeId">{t("form.employeeId")}</Label>
            <Input
              id="employeeId"
              name="employeeId"
              type="number"
              value={newSupervisor.employeeId}
              onChange={handleChange}
              placeholder={t("form.employeeIdPlaceholder")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">{t("form.phoneNumber")}</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="number"
              value={newSupervisor.phoneNumber}
              onChange={handleChange}
              placeholder={t("form.phoneNumberPlaceholder")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">{t("form.address")}</Label>
            <Input
              id="address"
              name="address"
              value={newSupervisor.address}
              onChange={handleChange}
              placeholder={t("form.addressPlaceholder")}
            />
          </div>
          <div className="grid gap-2 ">
            <Label htmlFor="gender">{t("form.gender")}</Label>
            <Select 
            
              value={newSupervisor.gender} 
              onValueChange={handleGenderChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("form.genderPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t("form.male")}</SelectItem>
                <SelectItem value="Female">{t("form.female")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-4">
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
        </form>
      </DialogContent>
    </Dialog>
  )
}