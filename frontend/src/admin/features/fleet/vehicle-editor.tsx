"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Luggage, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { EditorShell } from "@/admin/components/form/editor-shell";
import { ImageField } from "@/admin/components/form/image-field";
import { LocalizedField } from "@/admin/components/form/localized-field";
import { Repeater } from "@/admin/components/form/repeater";
import { SlugField } from "@/admin/components/form/slug-field";
import { Field } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Card, CardBody, CardHeader } from "@/admin/components/ui/primitives";
import { useCollection, useRemoveItem, useSaveItem } from "@/admin/lib/content/hooks";
import { ContentValidationError } from "@/admin/lib/content/repository";
import { emptyLocalized, type Vehicle } from "@/admin/lib/content/types";
import { toVehicleForm, vehicleSchema, type VehicleFormValues } from "./vehicle-schema";

function NumberField({ name, label, hint, icon }: { name: "passengers" | "luggage"; label: string; hint: string; icon: ReactNode }) {
  const { register, getFieldState, formState } = useFormContext<VehicleFormValues>();
  const error = getFieldState(name, formState).error?.message;
  return (
    <Field label={label} htmlFor={name} required hint={hint} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">{icon}</span>
        <Input
          id={name}
          type="number"
          inputMode="numeric"
          className="ps-9"
          aria-invalid={error ? true : undefined}
          {...register(name, { valueAsNumber: true })}
        />
      </div>
    </Field>
  );
}

export function VehicleEditor({ vehicle }: { vehicle: Vehicle | null }) {
  const router = useRouter();
  const isNew = !vehicle;
  const save = useSaveItem("vehicles");
  const remove = useRemoveItem("vehicles");
  const { data: services = [] } = useCollection("services");

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: toVehicleForm(vehicle),
    mode: "onTouched",
  });

  async function onSubmit(values: VehicleFormValues) {
    try {
      const saved = await save.mutateAsync(values);
      form.reset(toVehicleForm(saved));
      toast.success(isNew ? "Vehicle created" : "Changes saved", {
        description: saved.status === "draft" ? "It's a draft, so it isn't shown on the website yet." : undefined,
      });
      if (isNew) router.replace(`/admin/fleet/${saved.id}`);
    } catch (error) {
      if (error instanceof ContentValidationError && error.field) {
        form.setError(error.field as "slug", { message: error.message }, { shouldFocus: true });
      } else {
        toast.error("Couldn't save the vehicle", { description: (error as Error).message });
      }
    }
  }

  const usedBy = vehicle ? services.filter((service) => service.vehicleIds.includes(vehicle.id)) : [];

  return (
    <EditorShell
      form={form}
      noun="vehicle"
      isNew={isNew}
      saving={save.isPending}
      onSubmit={onSubmit}
      updatedAt={vehicle?.updatedAt}
      title={isNew ? "New vehicle" : vehicle.name.en || "Untitled vehicle"}
      description={isNew ? "Add a vehicle class to the fleet. It also becomes an option in the quote form." : undefined}
      breadcrumbs={[{ label: "Fleet", href: "/admin/fleet" }]}
      onDelete={
        vehicle
          ? async () => {
              await remove.mutateAsync(vehicle.id);
              toast.success(`"${vehicle.name.en}" deleted`);
              router.push("/admin/fleet");
            }
          : undefined
      }
      deleteWarning={
        usedBy.length > 0 ? (
          <p className="mt-2">
            It is recommended on {usedBy.length} {usedBy.length === 1 ? "service" : "services"} (
            {usedBy.map((service) => service.title.en).join(", ")}) and will be removed from them.
          </p>
        ) : undefined
      }
    >
      <Card>
        <CardHeader title="Basics" description="How the class appears in the fleet, on service pages and in the quote form." />
        <CardBody>
          <div className="grid gap-5 sm:grid-cols-2">
            <LocalizedField name="name" label="Class name" required maxLength={40} placeholder="First Class" />
            <Field
              label="Vehicle model"
              htmlFor="model"
              required
              hint="Same in every language."
              error={form.formState.errors.model?.message}
            >
              <Input id="model" placeholder="Mercedes-Benz S-Class · 2026" aria-invalid={form.formState.errors.model ? true : undefined} {...form.register("model")} />
            </Field>
          </div>
          <LocalizedField name="description" label="Description" required multiline rows={3} maxLength={320} />
          <SlugField source="name.en" prefix="/fleet#" autoFollow={isNew} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Capacity" description="The quote form uses these limits for passengers and luggage." />
        <CardBody className="sm:grid-cols-2">
          <NumberField name="passengers" label="Passengers" hint="Maximum seated passengers." icon={<Users />} />
          <NumberField name="luggage" label="Luggage" hint="Maximum suitcases." icon={<Luggage />} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Photo" />
        <CardBody>
          <ImageField name="image" label="Vehicle photo" required hint="A 4:3 photo of the car, ideally three-quarter view." aspect="4 / 3" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="On board" description="Short feature tags, e.g. “Privacy glass”." />
        <CardBody>
          <Repeater
            name="features"
            itemLabel="feature"
            max={8}
            createItem={emptyLocalized}
            emptyText="No features listed yet."
            renderItem={(index) => <LocalizedField name={`features.${index}`} label="Feature" required maxLength={60} />}
          />
        </CardBody>
      </Card>
    </EditorShell>
  );
}
