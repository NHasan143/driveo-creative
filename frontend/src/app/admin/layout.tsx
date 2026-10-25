import type { Metadata, Viewport } from "next";
import { AppShell } from "@/admin/components/layout/app-shell";
import { themeInitScript } from "@/admin/components/layout/theme";
import { Providers } from "@/admin/components/providers";
import { siteConfig } from "@/config/site";
import { fraunces, manrope, notoKufiArabic } from "../fonts";
import "@/admin/styles/admin.css";

/**
 * Root layout for the content admin. It sits beside the website's `[locale]` root
 * layout, so website pages never load admin code or styles, and vice versa.
 */
export const metadata: Metadata = {
  title: { default: "Driveo Admin", template: "%s · Driveo Admin" },
  description: "Manage the Driveo Exclusive website: services, fleet, cities and site settings.",
  robots: { index: false, follow: false },
  icons: { icon: siteConfig.assets.favicon },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
};

const fontVariables = [fraunces, manrope, notoKufiArabic].map((font) => font.variable).join(" ");

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Runs while the HTML is parsed. On the client it renders as inert text/plain,
            which avoids React's "script tag while rendering" dev warning. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
