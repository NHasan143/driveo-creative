import { Clock3, Plane, Route, Sparkles, type LucideIcon } from "lucide-react";
import type { ServiceType } from "@/domain/booking";

export const serviceIcons: Record<ServiceType, LucideIcon> = {
  airport_transfer: Plane,
  point_to_point: Route,
  hourly_hire: Clock3,
  private_event: Sparkles,
};
