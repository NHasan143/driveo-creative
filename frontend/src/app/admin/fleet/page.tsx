import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { FleetList } from "@/admin/features/fleet/fleet-list";

export const metadata: Metadata = { title: "Fleet" };

export default function FleetPage() {
  return (
    <>
      <PageHeader
        title="Fleet"
        description="Vehicle classes offered to customers. Capacity limits also control the quote form."
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
    </>
  );
}
