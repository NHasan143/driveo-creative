import type { Metadata } from "next";
import { CityEditor } from "@/admin/features/cities/city-editor";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export const metadata: Metadata = { title: "New city" };

export default function NewCityPage() {
  return (
    <AuthGate>
      <CityEditor city={null} />
    </AuthGate>
  );
}
