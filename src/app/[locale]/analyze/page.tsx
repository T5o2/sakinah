import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/analyze">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "analyze" });
  return {
    title: t("metaTitle"),
    alternates: {
      canonical: `/${locale}/analyze`,
      languages: { ar: "/ar/analyze", en: "/en/analyze", "x-default": "/ar/analyze" },
    },
  };
}

/**
 * The density analysis page. Until the analysis exists (phase 2), it says so
 * plainly: nothing here pretends to work.
 */
export default function AnalyzePage({ params }: PageProps<"/[locale]/analyze">) {
  const { locale } = use(params);
  // The layout has already rejected unknown locales with notFound().
  setRequestLocale(locale as Locale);
  const t = useTranslations("analyze");

  return (
    <section className="flex flex-1 flex-col justify-center px-6 pb-16 pt-32 sm:px-10 lg:px-[7vw]">
      <div className="max-w-xl">
        <span aria-hidden="true" className="mb-7 block h-px w-16 bg-gold" />
        <h1 className="font-display text-4xl text-marble sm:text-5xl">{t("title")}</h1>
        <p className="mt-5 text-lg text-pretty text-stone">{t("body")}</p>
        <Link
          href="/"
          className="mt-9 inline-flex min-h-11 items-center rounded-full border border-sand/30 px-6 text-marble transition-colors hover:border-gold/60 hover:text-gold-soft"
        >
          {t("backHome")}
        </Link>
      </div>
    </section>
  );
}
