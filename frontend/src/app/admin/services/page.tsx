import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { ServicesList } from "@/admin/features/services/services-list";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Services"
        description="What Driveo offers. Each published service gets its own page, a place in the menu and an option in the quote form."
        actions={
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus aria-hidden="true" />
              New service
            </Link>
          </Button>
        }
      />
      <ServicesList />
    </>
  );
}
