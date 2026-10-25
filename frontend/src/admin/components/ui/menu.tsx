"use client";

import { DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/admin/lib/cn";

export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export function MenuContent({ children, align = "end" }: { children: ReactNode; align?: "start" | "end" }) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        sideOffset={6}
        className="z-50 min-w-44 rounded-lg border border-border bg-surface p-1 shadow-pop"
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export function MenuItem({
  children,
  onSelect,
  tone = "default",
  disabled,
}: {
  children: ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none select-none [&_svg]:size-4",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        tone === "danger"
          ? "text-danger data-[highlighted]:bg-danger-soft"
          : "text-foreground data-[highlighted]:bg-surface-muted",
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-border" />;
}
