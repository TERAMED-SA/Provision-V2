"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, Lock, SettingsIcon, User } from "lucide-react"
import { useTranslations } from "next-intl"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { getUser } from "@/features/auth/authApi"
import instance from "@/lib/api"

export default function SettingsModal() {
  const t = useTranslations("settings")
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [profileError, setProfileError] = useState<{ phoneNumber?: string }>({})

  useEffect(() => {
    async function validateSession() {
      try {
        const userData = await getUser()
        setUser(userData)
        setProfileForm({
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber || "",
        })
      } catch (err) {
        toast(`${t("error")}: ${t("userNotAuthenticated")}`)
      } finally {
        setLoading(false)
      }
    }
    validateSession()
  }, [t])

  const validateProfile = () => {
    const errors: { phoneNumber?: string } = {}
    const phone = profileForm.phoneNumber.trim()
    if (!phone) {
      errors.phoneNumber = t("profile.phoneNumberRequired")
    } else if (!/^\d+$/.test(phone)) {
      errors.phoneNumber = t("profile.phoneNumberInvalid")
    } else if (phone.length !== 9) {
      errors.phoneNumber = t("profile.phoneNumberLength")
    }
    setProfileError(errors)
    return Object.keys(errors).length === 0
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    if (!validateProfile()) return
    setUpdating(true)
    try {
      await instance.put(`/user/updateMe/${user._id}`, profileForm)
      setUser({ ...user, ...profileForm })
      toast(`${t("success")}: ${t("profileUpdated")}`)
    } catch (error) {
      toast(`${t("error")}: ${t("updateProfileError")}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!user) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast(`${t("error")}: ${t("passwordMismatch")}`)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast(`${t("error")}: ${t("passwordTooShort")}`)
      return
    }

    setUpdating(true)
    try {
      await instance.patch(`/user/updatePassword/${user._id}`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast(`${t("success")}: ${t("passwordUpdated")}`)
    } catch (error) {
      toast(`${t("error")}: ${t("updatePasswordError")}`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("error")}</CardTitle>
            <CardDescription>{t("userNotFound")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto p-2 sm:p-4">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-14 w-14 border-4 border-background shadow-lg">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className="text-lg">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            {t("title")}
          </h1>
        </div>
      </div>

      <Tabs
        defaultValue="profile"
        className="space-y-4 min-h-[490px] max-h-[490px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            {t("tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2 cursor-pointer">
            <Lock className="h-4 w-4" />
            {t("tabs.password")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="dark:bg-gray-900">
            <CardHeader>
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("profile.name")}</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder={t("profile.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder={t("profile.emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">{t("profile.number")}</Label>
                  <Input
                    id="number"
                    type="number"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    placeholder={t("profile.phoneNumber")}
                  />
                  {profileError.phoneNumber && (
                    <p className="text-sm text-destructive">{profileError.phoneNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setProfileForm({ name: user.name, email: user.email, phoneNumber: user.phoneNumber })}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleUpdateProfile} disabled={updating} className="cursor-pointer">
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("profile.update")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="dark:bg-gray-900">
            <CardHeader>
              <CardTitle>{t("password.title")}</CardTitle>
              <CardDescription>{t("password.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("password.current")}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("password.new")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{t("password.requirements")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("password.confirm")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                >
                  {t("cancel")}
                </Button>
                <Button onClick={handleUpdatePassword} disabled={updating} className="cursor-pointer">
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("password.update")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
