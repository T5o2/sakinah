import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Wordmark } from "./Wordmark";

/** A translucent capsule floating over the top of the page (the hero runs beneath it). */
export function SiteHeader() {
  const t = useTranslations("header");

  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 rounded-full border border-sand/15 bg-ink/45 py-1.5 ps-5 pe-1.5 backdrop-blur-md">
        <Wordmark />
        <nav aria-label={t("languageNav")}>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
