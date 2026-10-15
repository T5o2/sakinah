import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="w-full px-6 pb-8 pt-6 sm:px-10 lg:px-[7vw]">
      <p className="max-w-prose border-t border-sand/10 pt-6 text-sm text-stone">
        {t("privacy")}
      </p>
    </footer>
  );
}
