import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  const t = useTranslations("header");

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-6">
      <Wordmark />
      <nav aria-label={t("languageNav")}>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
