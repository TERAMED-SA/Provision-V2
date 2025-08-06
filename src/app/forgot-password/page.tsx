"use client"

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, ArrowLeft, Mail, Fingerprint, RectangleEllipsis } from 'lucide-react';
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Mode } from "@/components/dashboard/header/mode";
import LocaleSwitcher from "@/components/dashboard/locale-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const createEmailSchema = (t: any) =>
  z.object({
    email: z
      .string()
      .email(t("validation.emailInvalid"))
      .min(1, t("validation.emailRequired")),
  });

const createCodeSchema = (t: any) =>
  z.object({
    code: z
      .string()
      .length(6, t("validation.codeLength"))
      .regex(/^\d+$/, t("validation.codeDigits")),
  });

const createPasswordSchema = (t: any) =>
  z.object({
    password: z.string().min(8, t("validation.passwordMin")),
    confirmPassword: z.string().min(1, t("validation.confirmRequired")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwordMatch"),
    path: ["confirmPassword"],
  });

type EmailFormData = {
  email: string;
};

type CodeFormData = {
  code: string;
};

type PasswordFormData = {
  password: string;
  confirmPassword: string;
};

type Step = 1 | 2 | 3;

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [codeInputs, setCodeInputs] = useState<string[]>(["", "", "", "", "", ""]);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const t = useTranslations("forgotPassword");
  const router = useRouter();

  // Form configurations for each step
  const emailSchema = createEmailSchema(t);
  const codeSchema = createCodeSchema(t);
  const passwordSchema = createPasswordSchema(t);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Step 1: Send reset email
  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmail(data.email);
      setCurrentStep(2);
      toast.success(t("messages.codeSent"));
    } catch (error) {
      toast.error(t("messages.emailError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);

    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    if (newInputs.every(input => input !== "") && newInputs.join("").length === 6) {
      codeForm.setValue("code", newInputs.join(""));
      handleCodeSubmit();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeSubmit = async () => {
    const code = codeInputs.join("");
    if (code.length !== 6) {
      toast.error(t("messages.codeIncomplete"));
      return;
    }

    try {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep(3);
      toast.success(t("messages.codeVerified"));
    } catch (error) {
      toast.error(t("messages.codeError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsLoading(true);
     await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(t("messages.passwordReset"));
      router.push("/");
    } catch (error) {
      toast.error(t("messages.passwordError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCodeInputs(["", "", "", "", "", ""]);
      toast.success(t("messages.codeResent"));
    } catch (error) {
      toast.error(t("messages.resendError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center rounded-2xl w-10 md:w-12 lg:w-14 h-1  border-2 transition-all duration-200 ${
              currentStep >= step 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
             
            </div>
           
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Step 1: Email Input
  const EmailStep = () => (
    <div className=" flex flex-col items-center gap-6">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
        <Fingerprint  className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-800 dark:text-gray-100">
          {t("step1.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("step1.subtitle")}
        </p>
      </div>
      
      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="w-full space-y-4 ">
        <div>
          <label htmlFor="email" className="block  font-medium text-gray-700 dark:text-gray-400 mb-1">
            {t("step1.email")}
          </label>
          <Input
            id="email"
            type="email"
            {...emailForm.register("email")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
            placeholder={t("step1.emailPlaceholder")}
          />
          {emailForm.formState.errors.email && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {emailForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-bold py-2.5 px-4 rounded-md transition duration-200 ease-in-out"
        >
          {isLoading ? (
            <span className="inline-flex gap-2 items-center">
              {t("step1.sending")}
              <Loader2 className="animate-spin size-5" />
            </span>
          ) : (
            t("step1.resetButton")
          )}
        </Button>
      </form>
    </div>
  );

  // Step 2: Code Verification
  const CodeStep = () => (
    <div className="text-center flex flex-col items-center gap-6">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-800 dark:text-gray-100">
          {t("step2.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("step2.subtitle", { email })}
        </p>
      </div>
      
      <div className="w-full space-y-6">
        <div className="flex justify-center gap-3">
          {codeInputs.map((value, index) => (
            <Input
              key={index}
              ref={(el) => (codeRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          ))}
        </div>

        <Button
          onClick={handleCodeSubmit}
          disabled={isLoading || codeInputs.some(input => input === "")}
          className="w-full  cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-bold py-2.5 px-4 rounded-md transition duration-200 ease-in-out"
        >
          {isLoading ? (
            <span className="inline-flex gap-2 items-center">
              {t("step2.verifying")}
              <Loader2 className="animate-spin size-5" />
            </span>
          ) : (
            t("step2.continueButton")
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t("step2.didntReceive")}
          </p>
          <Button
            onClick={handleResendCode}
            disabled={isLoading}
            type="reset"
            variant={"ghost"}
            className=" cursor-pointer  dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {t("step2.resendCode")}
          </Button>
        </div>
      </div>
    </div>
  );

  // Step 3: New Password
  const PasswordStep = () => (
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900  rounded-full flex items-center justify-center mb-4">
        <RectangleEllipsis  className="w-8 h-8  text-blue-600 dark:text-blue-400" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-800 dark:text-gray-100">
          {t("step3.title")}
        </h1>
        <p className="text-gray-600  dark:text-gray-400">
          {t("step3.subtitle")}
        </p>
      </div>
      
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="w-full space-y-4">
        <div>
          <label htmlFor="password" className="block  font-medium text-gray-700 dark:text-gray-400 mb-1">
            {t("step3.password")}
          </label>
          <Input
            id="password"
            type="password"
            {...passwordForm.register("password")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
            placeholder={t("step3.passwordPlaceholder")}
          />
          {passwordForm.formState.errors.password && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {passwordForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block font-medium text-gray-700 dark:text-gray-400 mb-1">
            {t("step3.confirmPassword")}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            {...passwordForm.register("confirmPassword")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
            placeholder={t("step3.confirmPasswordPlaceholder")}
          />
          {passwordForm.formState.errors.confirmPassword && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {passwordForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-bold py-2.5 px-4 rounded-md transition duration-200 ease-in-out"
        >
          {isLoading ? (
            <span className="inline-flex gap-2 items-center">
              {t("step3.resetting")}
              <Loader2 className="animate-spin size-5" />
            </span>
          ) : (
            t("step3.resetButton")
          )}
        </Button>
      </form>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <EmailStep />;
      case 2:
        return <CodeStep />;
      case 3:
        return <PasswordStep />;
      default:
        return <EmailStep />;
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center gap-4 p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="mb-4 font-sans inline-block font-bold text-white">
            <Image
              src={"/placeholder.svg"}
              alt="Logo"
              width={100}
              height={100}
              className=""
            />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-center w-full">
          <div className="w-full flex flex-col gap-8 max-w-md">
         
            {renderCurrentStep()}
            
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.backToLogin")}
              </Link>
            </div>
          </div>
        </div>
           <StepIndicator />
      </div>
      
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute top-4 left-6 flex justify-between items-center gap-4 z-20">
          <LocaleSwitcher className="shadow-sm" showLabel />
          <Mode />
        </div>
        <Image
          width={1000}
          height={1000}
          src="/left.jpeg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      
    </div>
  );
}
