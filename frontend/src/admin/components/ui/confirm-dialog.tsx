"use client";

import { AlertTriangle } from "lucide-react";
import { AlertDialog } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/admin/lib/cn";
import { buttonClass } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  tone?: "danger" | "primary";
  busy?: boolean;
}

/** Accessible confirmation for destructive or irreversible actions. Escape or Cancel backs out. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  tone = "danger",
  busy = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-border bg-surface p-6 shadow-pop",
          )}
        >
          <div className="flex gap-4">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                tone === "danger" ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary",
              )}
            >
              <AlertTriangle aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <AlertDialog.Title className="text-base font-bold">{title}</AlertDialog.Title>
              <AlertDialog.Description asChild>
                <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</div>
              </AlertDialog.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel className={buttonClass("secondary")}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              className={buttonClass(tone === "danger" ? "danger" : "primary")}
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                onConfirm();
              }}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
