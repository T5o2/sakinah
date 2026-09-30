import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { HeroStage } from "@/components/hero/HeroStage";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  // The layout has already rejected unknown locales with notFound().
  setRequestLocale(locale as Locale);
  const t = useTranslations("home");

  return (
    <section className="relative isolate flex min-h-[560px] flex-1 flex-col overflow-hidden">
      <HeroStage />
      {/* The scene melts into the page at both edges, and the text stays legible over it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-linear-to-b from-ink via-ink/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t from-ink to-transparent"
      />
      <div className="pointer-events-none mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8 sm:pt-10">
        <div className="max-w-3xl">
          <span aria-hidden="true" className="mb-6 block h-px w-16 bg-gold" />
          <h1 className="font-display text-4xl leading-snug text-balance text-marble sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-stone sm:text-xl">
            {t("lead")}
          </p>
        </div>
      </div>
    </section>
  );
}
