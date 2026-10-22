import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaSnapchatGhost,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import type { SocialNetwork } from "@/config/site";

export const WhatsAppIcon = FaWhatsapp;

export const socialIcons: Record<SocialNetwork, { label: string; Icon: IconType }> = {
  linkedin: { label: "LinkedIn", Icon: FaLinkedinIn },
  tiktok: { label: "TikTok", Icon: FaTiktok },
  snapchat: { label: "Snapchat", Icon: FaSnapchatGhost },
  facebook: { label: "Facebook", Icon: FaFacebookF },
  instagram: { label: "Instagram", Icon: FaInstagram },
};
