// app/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "../../lib/service"; // ajuste conforme necessário

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
