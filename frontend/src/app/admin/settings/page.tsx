"use client";

import { Skeleton } from "@/admin/components/ui/primitives";
import { SettingsEditor } from "@/admin/features/settings/settings-editor";
import { useSettings } from "@/admin/lib/content/hooks";

export default function SettingsPage() {
  const { data: settings, isPending } = useSettings();

  if (isPending || !settings) {
    return (
      <div className="grid gap-6" aria-busy="true" aria-label="Loading settings">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  // Remount after a save or a reset so the form always starts from stored values.
  return <SettingsEditor key={settings.updatedAt} settings={settings} />;
}
