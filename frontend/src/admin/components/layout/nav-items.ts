import { CarFront, LayoutDashboard, MapPin, Sparkles, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, description: "Content at a glance" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/services", label: "Services", icon: Sparkles, description: "What Driveo offers" },
      { href: "/admin/fleet", label: "Fleet", icon: CarFront, description: "Vehicle classes" },
      { href: "/admin/cities", label: "Cities", icon: MapPin, description: "Where Driveo operates" },
    ],
  },
];

/** Public website (same app), linked from the admin for checking changes. */
export const WEBSITE_URL = "/";
