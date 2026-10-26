import { Briefcase, Clock3, Heart, Map, Plane, Route, Sparkles, Star, type LucideIcon } from "lucide-react";
import type { ServiceIcon } from "@/admin/lib/content/types";

/** Icons a service can use; the content admin offers the same set. */
export const serviceIcons: Record<ServiceIcon, LucideIcon> = {
  plane: Plane,
  route: Route,
  clock: Clock3,
  sparkles: Sparkles,
  briefcase: Briefcase,
  heart: Heart,
  map: Map,
  star: Star,
};
