import { Fraunces, Inter, Libre_Baskerville, Manrope, Noto_Kufi_Arabic, Source_Serif_4 } from "next/font/google";

/* Website type, from the design: Inter for text, Source Serif 4 for headings and
   Libre Baskerville for a few card titles. All three cover Latin; Inter and
   Source Serif 4 also cover Cyrillic for the Bulgarian site. */

export const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-source-serif",
  display: "swap",
});

export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin", "latin-ext"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

/* The admin (/admin) keeps its own type. */
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

/** Fallback for Arabic glyphs; only downloaded when Arabic text is rendered. */
export const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = [inter, sourceSerif, libreBaskerville, notoKufiArabic]
  .map((font) => font.variable)
  .join(" ");
