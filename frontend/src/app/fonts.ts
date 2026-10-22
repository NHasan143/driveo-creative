import { Fraunces, Manrope, Noto_Kufi_Arabic, Space_Mono } from "next/font/google";

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

export const spaceMono = Space_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

/** Fallback for Arabic glyphs; only downloaded when Arabic text is rendered. */
export const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = [fraunces, manrope, spaceMono, notoKufiArabic]
  .map((font) => font.variable)
  .join(" ");
