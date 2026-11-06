import type { Metadata } from "next";
import { AuthGate } from "@/admin/components/auth/auth-gate";
import { PageHeader } from "@/admin/components/layout/page-header";
import { MyAccount } from "@/admin/features/people/my-account";

export const metadata: Metadata = { title: "My account" };

export default function MyAccountPage() {
  return (
    <AuthGate>
      <PageHeader title="My account" description="Your name, contact details and password." />
      <MyAccount />
    </AuthGate>
  );
}
