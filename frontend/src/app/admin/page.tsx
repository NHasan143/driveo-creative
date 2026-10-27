import type { Metadata } from "next";
import { Dashboard } from "@/admin/features/dashboard/dashboard";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}
