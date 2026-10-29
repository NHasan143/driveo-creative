import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { FleetList } from "@/admin/features/fleet/fleet-list";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export const metadata: Metadata = { title: "Fleet" };

export default function FleetPage() {
  return (
    <AuthGate>
      <PageHeader
        title="Fleet"
        description="Vehicle classes offered to customers. Capacity limits also control the booking form."
        actions={
          <Button asChild>
            <Link href="/admin/fleet/new">
              <Plus aria-hidden="true" />
              New vehicle
            </Link>
          </Button>
        }
      />
      <FleetList />
    </AuthGate>
  );
}
