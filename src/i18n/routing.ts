import { defineRouting } from "next-intl/routing";
import {
  defaultLocale,
  LOCALE_COOKIE_MAX_AGE,
  locales,
} from "@/lib/config/locale";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every language has its own shareable URL: /ar/... and /en/...
  localePrefix: "always",
  // A manual choice outranks the browser language on later visits.
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: LOCALE_COOKIE_MAX_AGE,
  },
});
