"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/admin/components/ui/button";

interface RepeaterProps {
  /** Path to an array in the form values. */
  name: string;
  /** Singular noun used in buttons and labels, e.g. "fact". */
  itemLabel: string;
  /** Value for a newly added item. */
  createItem: () => object;
  renderItem: (index: number) => ReactNode;
  min?: number;
  max?: number;
  emptyText?: string;
}

/** A list the editor can add to, remove from and reorder, one card per item. */
export function Repeater({ name, itemLabel, createItem, renderItem, min = 0, max = 12, emptyText }: RepeaterProps) {
  const { control } = useFormContext();
  // Items such as testimonials carry their own `id`, so the generated key gets another name.
  const { fields, append, remove, move } = useFieldArray({ control, name, keyName: "fieldKey" });

  return (
    <div className="grid gap-3">
      {fields.length === 0 && emptyText && (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.fieldKey} className="rounded-lg border border-border bg-surface-muted/50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              {itemLabel} {index + 1}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Move ${itemLabel} ${index + 1} up`}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Move ${itemLabel} ${index + 1} down`}
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                variant="danger-ghost"
                size="icon-sm"
                aria-label={`Remove ${itemLabel} ${index + 1}`}
                disabled={fields.length <= min}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="grid gap-4">{renderItem(index)}</div>
        </div>
      ))}

      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => append(createItem())} disabled={fields.length >= max}>
          <Plus aria-hidden="true" />
          Add {itemLabel}
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {fields.length} of {max} max
        </span>
      </div>
    </div>
  );
}
