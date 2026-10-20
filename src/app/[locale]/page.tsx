import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { HeroStage } from "@/components/hero/HeroStage";
import { Link } from "@/i18n/navigation";

const STEPS = ["source", "analysis", "result"] as const;

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  // The layout has already rejected unknown locales with notFound().
  setRequestLocale(locale as Locale);
  const t = useTranslations("home");

  return (
    <>
      {/* Two halves on wide screens: the text at the start of the line (right
          in Arabic, left in English), the scene opposite, edge to edge. On a
          phone the scene comes first, full width, the text below it. */}
      <section
        aria-labelledby="hero-title"
        className="relative grid lg:h-svh lg:min-h-[640px] lg:grid-cols-2"
      >
        {/* The scene through a round lens, centred in its half: its rim
            fades softly into the night, with no hard edge. */}
        <div className="flex items-center justify-center px-4 pt-24 lg:col-start-2 lg:row-start-1 lg:px-0 lg:pt-16">
          <div className="hero-lens relative isolate aspect-square w-[min(100%,56svh)] lg:w-[min(88%,82svh)]">
            <HeroStage />
            {/* Warm light gathered round the Kaaba. */}
            <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
          </div>
        </div>

        <div className="relative z-10 flex items-center px-6 pb-16 pt-6 sm:px-10 lg:col-start-1 lg:row-start-1 lg:justify-center lg:px-[4vw] lg:pb-0 lg:pt-16">
          {/* One block, centred in its half and aligned to the start of the line. */}
          <div className="w-full max-w-[34rem]">
            <span aria-hidden="true" className="mb-7 block h-px w-16 bg-gold lg:mb-9" />
            <h1
              id="hero-title"
              className="max-w-[11ch] font-display text-[clamp(2.75rem,5.4vw,6.5rem)] leading-[1.2] text-balance text-marble"
            >
              {t("title")}
            </h1>
            <p className="mt-6 max-w-[32rem] text-lg text-pretty text-stone lg:mt-8 lg:text-xl">
              {t("lead")}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 lg:mt-12">
              <Link
                href="/analyze"
                className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 font-medium text-ink transition-colors hover:bg-gold-soft"
              >
                {t("analyze")}
              </Link>
              <a
                href="#how"
                className="inline-flex min-h-12 items-center rounded-full border border-sand/30 px-7 text-marble transition-colors hover:border-gold/60 hover:text-gold-soft"
              >
                {t("howLink")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how"
        aria-labelledby="how-title"
        className="scroll-mt-24 border-t border-sand/10 px-6 py-20 sm:px-10 lg:px-[7vw] lg:py-28"
      >
        <h2 id="how-title" className="font-display text-3xl text-marble lg:text-4xl">
          {t("how.title")}
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
          {STEPS.map((step, i) => (
            <li key={step}>
              <span aria-hidden="true" className="font-display text-2xl text-gold">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg text-marble">{t(`how.steps.${step}.title`)}</h3>
              <p className="mt-2 max-w-[36ch] text-stone">{t(`how.steps.${step}.body`)}</p>
            </li>
          ))}
        </ol>
        <p className="mt-14 max-w-prose text-sm text-stone">{t("how.note")}</p>
      </section>
    </>
  );
}
