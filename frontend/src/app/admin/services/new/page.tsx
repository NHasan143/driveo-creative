import type { Metadata } from "next";
import { ServiceEditor } from "@/admin/features/services/service-editor";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export const metadata: Metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <AuthGate>
      <ServiceEditor service={null} />
    </AuthGate>
  );
}
