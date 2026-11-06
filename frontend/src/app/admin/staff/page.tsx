import type { Metadata } from "next";
import { AuthGate } from "@/admin/components/auth/auth-gate";
import { StaffScreen } from "@/admin/features/people/staff-list";

export const metadata: Metadata = { title: "Staff" };

export default function StaffPage() {
  return (
    <AuthGate>
      <StaffScreen />
    </AuthGate>
  );
}
