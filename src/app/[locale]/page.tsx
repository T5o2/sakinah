import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  // The layout has already rejected unknown locales with notFound().
  setRequestLocale(locale as Locale);
  const t = useTranslations("home");

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <span aria-hidden="true" className="mb-8 block h-px w-16 bg-gold" />
        <h1 className="font-display text-4xl leading-snug text-balance text-marble sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-pretty text-stone sm:text-xl">
          {t("lead")}
        </p>
      </div>
    </section>
  );
}
