import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const NAMES = { ar: "سَكينة", en: "Sakinah" } as const;

/** Bilingual brand mark: the active language's name leads, the other follows quietly. */
export function Wordmark() {
  const t = useTranslations("header");
  const locale = useLocale();
  const other = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href="/"
      aria-label={t("homeLink")}
      className="group inline-flex min-h-11 items-baseline gap-3 rounded-sm"
    >
      <span lang={locale} className="font-display text-2xl leading-none text-marble">
        {NAMES[locale]}
      </span>
      <span
        aria-hidden="true"
        lang={other}
        // Arabic script reads smaller than Latin at the same size, so it gets one step more.
        className={`${other === "ar" ? "text-base" : "text-sm"} leading-none text-stone transition-colors group-hover:text-sand`}
      >
        {NAMES[other]}
      </span>
    </Link>
  );
}
