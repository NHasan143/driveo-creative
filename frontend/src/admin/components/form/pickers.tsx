"use client";

import { ArrowDown, ArrowUp, Check, Plus, X } from "lucide-react";
import { useController, useFormContext } from "react-hook-form";
import { Button } from "@/admin/components/ui/button";
import { cn } from "@/admin/lib/cn";

export interface PickerOption {
  id: string;
  label: string;
  detail?: string;
  muted?: boolean;
}

/** Choose items and set their order, e.g. recommended vehicles for a service. */
export function OrderedPicker({ name, options, emptyText }: { name: string; options: PickerOption[]; emptyText: string }) {
  const { control } = useFormContext();
  const { field } = useController({ control, name });
  const selected = (field.value as string[]) ?? [];
  const byId = new Map(options.map((option) => [option.id, option]));
  const available = options.filter((option) => !selected.includes(option.id));

  const update = (next: string[]) => field.onChange(next);
  const move = (from: number, to: number) => {
    const next = [...selected];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  return (
    <div className="grid gap-4">
      {selected.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ol className="grid gap-2">
          {selected.map((id, index) => {
            const option = byId.get(id);
            return (
              <li key={id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{option?.label ?? "Removed item"}</span>
                  {option?.detail && <span className="block truncate text-xs text-muted-foreground">{option.detail}</span>}
                </span>
                <Button variant="ghost" size="icon-sm" aria-label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move down"
                  disabled={index === selected.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  variant="danger-ghost"
                  size="icon-sm"
                  aria-label={`Remove ${option?.label ?? "item"}`}
                  onClick={() => update(selected.filter((value) => value !== id))}
                >
                  <X aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ol>
      )}

      {available.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {available.map((option) => (
            <Button key={option.id} variant="secondary" size="sm" onClick={() => update([...selected, option.id])}>
              <Plus aria-hidden="true" />
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Toggle any number of options on or off, e.g. the services offered in a city. */
export function CheckboxCards({ name, options }: { name: string; options: PickerOption[] }) {
  const { control } = useFormContext();
  const { field } = useController({ control, name });
  const selected = new Set((field.value as string[]) ?? []);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = selected.has(option.id);
        return (
          <button
            key={option.id}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => {
              const next = new Set(selected);
              if (checked) next.delete(option.id);
              else next.add(option.id);
              // Keep the options' own order so the saved list is stable.
              field.onChange(options.filter((item) => next.has(item.id)).map((item) => item.id));
            }}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-start transition-colors",
              checked ? "border-primary bg-primary-soft" : "border-border bg-surface hover:bg-surface-muted",
            )}
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-md border",
                checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
              )}
            >
              {checked && <Check aria-hidden="true" className="size-3.5" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{option.label}</span>
              {option.detail && <span className="block truncate text-xs text-muted-foreground">{option.detail}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
