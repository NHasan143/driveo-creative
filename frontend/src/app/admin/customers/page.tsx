import type { Metadata } from "next";
import { AuthGate } from "@/admin/components/auth/auth-gate";
import { PageHeader } from "@/admin/components/layout/page-header";
import { CustomersList } from "@/admin/features/people/customers-list";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <AuthGate>
      <PageHeader
        title="Customers"
        description="People with an account on the website, and the quote requests they sent while signed in."
      />
      <CustomersList />
    </AuthGate>
  );
}
