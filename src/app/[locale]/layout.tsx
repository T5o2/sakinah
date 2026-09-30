import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { routing } from "@/i18n/routing";
import { dirOf } from "@/lib/config/locale";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en", "x-default": "/ar" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "a11y" });

  return (
    <html lang={locale} dir={dirOf(locale)} className={fontVariables}>
      <body className="flex min-h-dvh flex-col bg-ink text-marble antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-kiswa px-4 py-3 text-sm focus:not-sr-only focus:absolute focus:start-4 focus:top-4"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <SiteHeader />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
