import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { NUMBERING_SYSTEM, TIME_ZONE } from "@/lib/config/locale";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: TIME_ZONE,
    formats: {
      number: {
        integer: { numberingSystem: NUMBERING_SYSTEM, maximumFractionDigits: 0 },
        percent: { numberingSystem: NUMBERING_SYSTEM, style: "percent" },
      },
      dateTime: {
        time: {
          numberingSystem: NUMBERING_SYSTEM,
          hour: "numeric",
          minute: "2-digit",
        },
      },
    },
  };
});
