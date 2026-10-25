import type { Metadata } from "next";
import { Dashboard } from "@/admin/features/dashboard/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <Dashboard />;
}
