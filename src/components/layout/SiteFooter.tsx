import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mx-auto w-full max-w-6xl px-5 pb-8 pt-6 sm:px-8">
      <p className="max-w-prose border-t border-sand/10 pt-6 text-sm text-stone">
        {t("privacy")}
      </p>
    </footer>
  );
}
