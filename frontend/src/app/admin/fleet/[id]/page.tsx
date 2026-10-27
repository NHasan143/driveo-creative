"use client";

import { ItemLoader } from "@/admin/components/content/item-loader";
import { VehicleEditor } from "@/admin/features/fleet/vehicle-editor";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export default function EditVehiclePage() {
  return (
    <AuthGate>
      <ItemLoader collection="vehicles" noun="vehicle" backHref="/admin/fleet">
        {(vehicle) => <VehicleEditor vehicle={vehicle} />}
      </ItemLoader>
    </AuthGate>
  );
}
