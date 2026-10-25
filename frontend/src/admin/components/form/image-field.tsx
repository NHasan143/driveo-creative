"use client";

import { Check, ImageIcon, ImagePlus, Trash2, Upload } from "lucide-react";
import { Dialog } from "radix-ui";
import { useId, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonClass } from "@/admin/components/ui/button";
import { Field } from "@/admin/components/ui/field";
import { fileToCompressedDataUrl, MEDIA_LIBRARY } from "@/admin/lib/images";
import { cn } from "@/admin/lib/cn";

interface ImageFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** CSS aspect ratio of the preview, matching where the image is used. */
  aspect?: string;
}

/** Image picker: drop or upload a photo, or choose one from the website's library. */
export function ImageField({ name, label, hint, required, aspect = "16 / 9" }: ImageFieldProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ control, name });
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const id = useId();
  const value = (field.value as string) || "";

  async function accept(file: File | undefined) {
    if (!file) return;
    setProcessing(true);
    try {
      field.onChange(await fileToCompressedDataUrl(file));
      toast.success("Photo added", { description: "It has been resized for the website." });
    } catch (error) {
      toast.error("Couldn't use that file", { description: (error as Error).message });
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Field label={label} htmlFor={id} hint={hint} required={required} error={fieldState.error?.message}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          accept(event.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative overflow-hidden rounded-xl border-2 border-dashed bg-surface-muted transition-colors",
          dragging ? "border-primary bg-primary-soft" : fieldState.error ? "border-danger" : "border-border",
        )}
        style={{ aspectRatio: aspect }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- previews include local data URLs
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-4 text-center">
            <div>
              <ImageIcon aria-hidden="true" className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">Drop a photo here</p>
              <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG or WebP · up to 12 MB</p>
            </div>
          </div>
        )}
        {processing && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 text-sm font-semibold">
            Preparing photo…
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => accept(event.target.files?.[0])}
        />
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} loading={processing}>
          <Upload aria-hidden="true" />
          {value ? "Replace" : "Upload"}
        </Button>

        <Dialog.Root open={libraryOpen} onOpenChange={setLibraryOpen}>
          <Dialog.Trigger className={buttonClass("secondary", "sm")}>
            <ImagePlus aria-hidden="true" />
            Choose from library
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85svh] w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-pop">
              <Dialog.Title className="text-base font-bold">Photo library</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Photos already used on the website.
              </Dialog.Description>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {MEDIA_LIBRARY.map((item) => {
                  const selected = item.src === value;
                  return (
                    <li key={item.src}>
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange(item.src);
                          setLibraryOpen(false);
                        }}
                        className={cn(
                          "group relative block w-full cursor-pointer overflow-hidden rounded-lg border-2 text-start transition-colors",
                          selected ? "border-primary" : "border-transparent hover:border-border",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- small library thumbnails */}
                        <img src={item.src} alt="" className="aspect-[4/3] w-full object-cover" />
                        <span className="block px-2 py-1.5 text-xs font-medium">{item.label}</span>
                        {selected && (
                          <span className="absolute top-2 end-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check aria-hidden="true" className="size-3.5" />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5 flex justify-end">
                <Dialog.Close className={buttonClass("secondary")}>Close</Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {value && (
          <Button variant="danger-ghost" size="sm" onClick={() => field.onChange("")}>
            <Trash2 aria-hidden="true" />
            Remove
          </Button>
        )}
      </div>
    </Field>
  );
}
