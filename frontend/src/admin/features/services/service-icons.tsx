import { Briefcase, Clock3, Heart, Map, Plane, Route, Sparkles, Star, type LucideIcon } from "lucide-react";
import type { ServiceIcon } from "@/admin/lib/content/types";

/** Matches the icons the website shows in the Services menu. */
export const SERVICE_ICON_COMPONENTS: Record<ServiceIcon, { Icon: LucideIcon; label: string }> = {
  plane: { Icon: Plane, label: "Plane" },
  route: { Icon: Route, label: "Route" },
  clock: { Icon: Clock3, label: "Clock" },
  sparkles: { Icon: Sparkles, label: "Sparkles" },
  briefcase: { Icon: Briefcase, label: "Briefcase" },
  heart: { Icon: Heart, label: "Heart" },
  map: { Icon: Map, label: "Map" },
  star: { Icon: Star, label: "Star" },
};
