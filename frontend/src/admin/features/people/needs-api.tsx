import { PlugZap } from "lucide-react";
import { Card, EmptyState } from "@/admin/components/ui/primitives";

/** People screens read real accounts, so demo mode (browser storage) has nothing to show. */
export function NeedsApi() {
  return (
    <Card>
      <EmptyState
        icon={<PlugZap aria-hidden="true" />}
        title="Needs the Driveo API"
        description="Customers and staff accounts live in the Driveo database. Set NEXT_PUBLIC_ADMIN_CONTENT_SOURCE=api and sign in to manage them."
      />
    </Card>
  );
}
