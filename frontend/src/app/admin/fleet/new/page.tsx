import type { Metadata } from "next";
import { VehicleEditor } from "@/admin/features/fleet/vehicle-editor";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export const metadata: Metadata = { title: "New vehicle" };

export default function NewVehiclePage() {
  return (
    <AuthGate>
      <VehicleEditor vehicle={null} />
    </AuthGate>
  );
}
