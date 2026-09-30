/**
 * Single source of truth for locale-level presentation settings.
 * Both languages use Latin digits (0123) and all times are shown in Makkah time.
 */

export const locales = ["ar", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "ar";

export type Direction = "rtl" | "ltr";

export const TIME_ZONE = "Asia/Riyadh";
export const NUMBERING_SYSTEM = "latn";

/** One year, in seconds — how long a manual language choice is remembered. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function dirOf(locale: AppLocale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Sign to multiply horizontal motion offsets by, so that "forward" follows
 * the reading direction: -1 in RTL, +1 in LTR.
 */
export function directionSign(dir: Direction): 1 | -1 {
  return dir === "rtl" ? -1 : 1;
}

/** Number formatter that always uses Latin digits, whatever the locale. */
export function formatNumber(
  locale: AppLocale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, {
    ...options,
    numberingSystem: NUMBERING_SYSTEM,
  }).format(value);
}
