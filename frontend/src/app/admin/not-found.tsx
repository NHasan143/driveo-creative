import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/admin/components/ui/button";
import { Card, EmptyState } from "@/admin/components/ui/primitives";

export default function NotFound() {
  return (
    <Card>
      <EmptyState
        icon={<Compass />}
        title="Page not found"
        description="This admin page doesn't exist. Use the menu to find what you need."
        action={
          <Button asChild>
            <Link href="/admin">Go to the dashboard</Link>
          </Button>
        }
      />
    </Card>
  );
}
