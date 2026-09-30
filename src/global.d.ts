import type { routing } from "@/i18n/routing";
import type messages from "../messages/ar.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    // Arabic is the reference catalogue; a key missing from en.json fails the parity test.
    Messages: typeof messages;
  }
}
