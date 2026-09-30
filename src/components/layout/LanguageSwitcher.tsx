"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/lib/config/locale";

// Each language is named in its own script, so it is recognisable to its readers.
const LANGUAGE_NAMES: Record<AppLocale, string> = {
  ar: "العربية",
  en: "English",
};

function SwitcherLink({ query }: { query?: Record<string, string | string[]> }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target: AppLocale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={{ pathname, query }}
      locale={target}
      lang={target}
      // Prefetching would hit the proxy and save a language the user never chose.
      prefetch={false}
      // Arabic script reads smaller than Latin at the same size, so it gets one step more.
      className={`${target === "ar" ? "text-base" : "text-sm"} inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-sand/20 px-4 text-marble transition-colors hover:border-gold/60 hover:text-gold-soft`}
    >
      {LANGUAGE_NAMES[target]}
    </Link>
  );
}

function SwitcherLinkWithQuery() {
  const searchParams = useSearchParams();
  // Keep repeated keys (?type=a&type=b) intact; Object.fromEntries would drop all but the last.
  const query: Record<string, string | string[]> = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    query[key] = values.length === 1 ? values[0]! : values;
  }
  return <SwitcherLink query={query} />;
}

/**
 * Switches to the other language on the same page, keeping the query string.
 * The choice is remembered by the proxy in the NEXT_LOCALE cookie.
 */
export function LanguageSwitcher() {
  return (
    // useSearchParams needs a Suspense boundary on statically rendered pages.
    <Suspense fallback={<SwitcherLink />}>
      <SwitcherLinkWithQuery />
    </Suspense>
  );
}
