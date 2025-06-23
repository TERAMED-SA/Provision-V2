"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import logo from "../../public/logo.png";
import { Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import LocaleSwitcher from "../components/dashboard/locale-switcher";
import { useAuth } from "@/hooks/useAuth";

const createSchema = (t: any) =>
  z.object({
    number: z
      .string()
      .length(9, t("validation.numberLength"))
      .regex(/^\d+$/, t("validation.numberDigits")),
    password: z.string().min(6, t("validation.passwordMin")),
  });

type FormData = {
  number: string;
  password: string;
};

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const t = useTranslations("login");
  const { login, error } = useAuth();
  const router = useRouter();

  const schema = createSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
       await login(data.number, data.password);
      toast.success(t("messages.loginSuccess"));
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Erro ao fazer login:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object"
      ) {
        const response = (error as any).response;
        const message = response.data?.message;
        const statusCode = response.data?.statusCode;

        if (statusCode === 404 && message === "User not found") {
          toast.error(t("messages.userNotFound"));
        } else if (statusCode === 401) {
          toast.error(t("messages.invalidCredentials"));
        } else {
          toast.error(t("messages.loginError"));
        }
      } else {
        toast.error(t("messages.serverConnectionError"));
      }
    } finally {
      setIsLoading(false);
    }
  };
  return  (
     <div className="grid min-h-svh lg:grid-cols-2">
          <div className="flex flex-col items-center gap-4 p-6 md:p-10">
        <div className="flex justify-center   md:justify-start">
          <Link
            href="/"
            className="mb-4 font-sans inline-block font-bold text-white"
          >
            <Image
              src={logo}
              alt="Logo"
              width={100}
              height={100}
              className=""
            />
          </Link>
        </div>

        <div className="flex flex-1  items-center justify-center w-full ">
          <div className="w-full flex flex-col gap-12 max-w-md">
            <div className="text-center flex flex-col items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-medium text-gray-800 dark:text-gray-100">{t("form.title")}</h1>
              <p>{t("form.subtitle")}</p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="w-full flex flex-col gap-3.5  "
            >
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                >
                  {t("form.phoneNumber")}
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  maxLength={9}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...register("number")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  placeholder={t("form.phoneNumberPlaceholder")}
                />
                {errors.number && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.number.message}
                  </p>
                )}
              </div>

              <div className="mb-4 relative">
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
                  htmlFor="senha"
                >
                  {t("form.password")}
                </label>
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  {...register("password")}
                  placeholder={t("form.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-9 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <Link
                  href="#"
                  className="text-sm text-gray-700 font-medium dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  {t("form.forgotPassword")}
                </Link>
              </div>

              <div className="mb-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black dark:bg-blue-700 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-500 text-white text-base font-bold py-2.5 px-4 rounded-md transition duration-200 ease-in-out"
                >
                  {isLoading ? (
                    <span className="inline-flex gap-1 items-center">
                      {t("form.loggingIn")}{" "}
                      <Loader2 className="animate-spin size-5 text-gray-200" />
                    </span>
                  ) : (
                    t("form.loginButton")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted  relative hidden lg:block">
          <div className="absolute top-4 left-6 flex justify-between items-center z-20">
          <LocaleSwitcher className="shadow-sm" showLabel />
        </div>
        <Image
        width={1000}
        height={1000}
          src="/left.jpeg"
          alt="Image"
          className="absolute inset-0  h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
  
    </div>
  ) 
 
}
