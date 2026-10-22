import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { en } from "@/i18n/dictionaries/en";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.legalName,
    short_name: siteConfig.shortName,
    description: en.meta.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: siteConfig.themeColor,
    theme_color: siteConfig.themeColor,
    icons: [
      { src: siteConfig.assets.appIcon, sizes: "816x816", type: "image/png", purpose: "any" },
      { src: siteConfig.assets.appIcon, sizes: "816x816", type: "image/png", purpose: "maskable" },
      { src: siteConfig.assets.favicon, sizes: "any", type: "image/svg+xml" },
    ],
  };
}
