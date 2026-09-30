import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  Marcellus,
  Reem_Kufi,
} from "next/font/google";

// Display (Arabic): contemporary Kufi. The Latin subset covers the Latin
// digits that appear inside Arabic headings.
export const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  variable: "--font-reem-kufi",
  display: "swap",
});

// Display (English): carved-stone Roman capitals that sit well beside the Kufi.
// Single weight only, so headings never rely on bold.
export const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
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

export const fontVariables = [reemKufi, marcellus, plexArabic, plexSans]
  .map((font) => font.variable)
  .join(" ");
