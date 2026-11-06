"use client";

import { AuthGate } from "@/admin/components/auth/auth-gate";
import { CustomerDetailScreen } from "@/admin/features/people/customer-detail";

export default function CustomerPage() {
  return (
    <AuthGate>
      <CustomerDetailScreen />
    </AuthGate>
  );
}
