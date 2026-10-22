import { env } from "./env";

export const siteConfig = {
  name: "Driveo Exclusive",
  legalName: "Driveo Exclusive Limited",
  shortName: "Driveo",
  url: env.siteUrl,
  themeColor: "#12100e",
  contact: {
    phone: "+44 330 043 0976",
    phoneHref: "tel:+443300430976",
    email: "info@driveoexclusive.com",
    whatsappHref:
      "https://wa.me/443300430976?text=Hello%20Driveo%2C%20I%27d%20like%20to%20request%20a%20quote.",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/driveo-exclusive/",
    tiktok: "https://www.tiktok.com/@driveo5",
    snapchat: "https://www.snapchat.com/add/driveoexclusive",
    facebook: "https://www.facebook.com/share/1EXpHn5pkE/",
    instagram: "https://www.instagram.com/driveoexclusive2023",
  },
  assets: {
    logo: "/images/logo.jpg",
    appIcon: "/icons/app-icon-512.png",
    favicon: "/icons/favicon.svg",
    heroPoster: "/media/driveo-journey-poster.jpg",
    heroVideos: ["/media/driveo-city-journey.mp4", "/media/driveo-sofia-dubai.mp4"],
  },
} as const;

export type SocialNetwork = keyof typeof siteConfig.social;
