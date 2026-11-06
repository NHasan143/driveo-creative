"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DatabaseZap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStaffUser } from "@/admin/components/auth/auth-gate";
import { Button } from "@/admin/components/ui/button";
import { ConfirmDialog } from "@/admin/components/ui/confirm-dialog";
import { Card, EmptyState } from "@/admin/components/ui/primitives";
import { adminRequest } from "@/admin/lib/admin-api";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";
import { contentKeys } from "@/admin/lib/content/hooks";
import { seed } from "@/admin/lib/content/seed";

/**
 * Fills an empty database with the website's built-in copy (services, fleet,
 * cities in four languages) through POST /api/v1/content/import/. Shown only
 * to superusers, and only while there is no content, so live edits can't be
 * replaced from here by accident.
 */
export function OriginalContentCard() {
  const { data: staff } = useStaffUser();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const load = useMutation({
    mutationFn: () => adminRequest("/v1/content/import/", { method: "POST", body: seed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKeys.all }),
  });

  if (IS_LOCAL_DEMO || !staff?.isSuperuser) return null;

  async function onConfirm() {
    try {
      await load.mutateAsync();
      toast.success("Original content loaded", { description: "Services, fleet and cities are on the website again." });
    } catch (error) {
      toast.error("Couldn't load the content", { description: (error as Error).message });
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <Card>
      <EmptyState
        icon={<DatabaseZap aria-hidden="true" />}
        title="The database has no content yet"
        description="Load the website's original copy: the four services, the fleet and the cities, in all four languages. You can edit everything afterwards."
        action={<Button onClick={() => setConfirmOpen(true)}>Load the website&apos;s original content</Button>}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="primary"
        title="Load the original content?"
        description="Adds the website's built-in services, vehicles and cities to the database and publishes them."
        confirmLabel="Load content"
        busy={load.isPending}
        onConfirm={onConfirm}
      />
    </Card>
  );
}
