import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { CitiesList } from "@/admin/features/cities/cities-list";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export const metadata: Metadata = { title: "Cities" };

export default function CitiesPage() {
  return (
    <AuthGate>
      <PageHeader
        title="Cities"
        description="Where Driveo operates. Published cities appear on the website and as pickup options in the booking form."
        actions={
          <Button asChild>
            <Link href="/admin/cities/new">
              <Plus aria-hidden="true" />
              New city
            </Link>
          </Button>
        }
      />
      <CitiesList />
    </AuthGate>
  );
}
