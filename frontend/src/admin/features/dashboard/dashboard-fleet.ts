import { FLEET_VEHICLES } from "@/domain/booking";
import type { Vehicle } from "@/admin/lib/content/types";

const classOrder = new Map<string, number>(FLEET_VEHICLES.map((id, index) => [id, index]));

/** Keep the complete dashboard fleet in class order, independently of recent activity. */
export function orderDashboardFleet<T extends Pick<Vehicle, "id" | "slug" | "order">>(vehicles: readonly T[]): T[] {
  const rank = (vehicle: T) =>
    classOrder.get(vehicle.id) ?? classOrder.get(vehicle.slug.replace(/-/g, "_")) ?? FLEET_VEHICLES.length;

  return [...vehicles].sort((a, b) => rank(a) - rank(b) || a.order - b.order);
}
