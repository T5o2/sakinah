import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <div className="max-w-xl">
        <p aria-hidden="true" className="font-display text-6xl text-gold tabular-nums">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl text-marble sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-stone">{t("body")}</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full border border-gold/50 px-5 text-sm text-gold-soft transition-colors hover:border-gold hover:text-marble"
        >
          {t("backHome")}
        </Link>
      </div>
    </section>
  );
}
