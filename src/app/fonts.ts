import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Reem_Kufi } from "next/font/google";

// Display: contemporary Kufi for headings in both languages (one identity).
export const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  variable: "--font-reem-kufi",
  display: "swap",
});

// Body (Arabic). Not variable on Google Fonts, so weights are explicit.
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

// Body (English).
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const fontVariables = [reemKufi, plexArabic, plexSans]
  .map((font) => font.variable)
  .join(" ");
