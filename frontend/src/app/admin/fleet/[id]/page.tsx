"use client";

import { ItemLoader } from "@/admin/components/content/item-loader";
import { VehicleEditor } from "@/admin/features/fleet/vehicle-editor";

export default function EditVehiclePage() {
  return (
    <ItemLoader collection="vehicles" noun="vehicle" backHref="/admin/fleet">
      {(vehicle) => <VehicleEditor vehicle={vehicle} />}
    </ItemLoader>
  );
}
