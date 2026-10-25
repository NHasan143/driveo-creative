import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { CitiesList } from "@/admin/features/cities/cities-list";

export const metadata: Metadata = { title: "Cities" };

export default function CitiesPage() {
  return (
    <>
      <PageHeader
        title="Cities"
        description="Where Driveo operates. Published cities appear on the website and as pickup options in the quote form."
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
    </>
  );
}
