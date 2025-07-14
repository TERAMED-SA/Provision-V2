import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "Provision",
  description:
    "Provision - Dashboard profissional para supervisão e ocorrências, desenvolvido pela TERAMED.",
  keywords: [
    "dashboard",
    "supervisão",
    "ocorrências",
    "gestão",
  " "
  ],
  authors: [{ name: "TERAMED", url: "https://teramed.ao/" }],
  creator: "TERAMED",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={``}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
