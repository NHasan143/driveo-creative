"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EditorShell } from "@/admin/components/form/editor-shell";
import { LocalizedField } from "@/admin/components/form/localized-field";
import { CheckboxCards } from "@/admin/components/form/pickers";
import { SlugField } from "@/admin/components/form/slug-field";
import { Card, CardBody, CardHeader } from "@/admin/components/ui/primitives";
import { useCollection, useRemoveItem, useSaveItem } from "@/admin/lib/content/hooks";
import { ContentValidationError } from "@/admin/lib/content/repository";
import type { City } from "@/admin/lib/content/types";
import { citySchema, toCityForm, type CityFormValues } from "./city-schema";

export function CityEditor({ city }: { city: City | null }) {
  const router = useRouter();
  const isNew = !city;
  const save = useSaveItem("cities");
  const remove = useRemoveItem("cities");
  const { data: services = [], isSuccess: servicesLoaded } = useCollection("services");

  const form = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: toCityForm(city),
    mode: "onTouched",
  });

  // A new city starts with every service ticked once the list has loaded.
  useEffect(() => {
    if (isNew && servicesLoaded && services.length && !form.formState.isDirty) {
      form.reset(toCityForm(null, services.map((service) => service.id)));
    }
  }, [isNew, servicesLoaded, services, form]);

  async function onSubmit(values: CityFormValues) {
    try {
      const saved = await save.mutateAsync(values);
      form.reset(toCityForm(saved));
      toast.success(isNew ? "City created" : "Changes saved", {
        description: saved.status === "draft" ? "It's a draft, so it isn't shown on the website yet." : undefined,
      });
      if (isNew) router.replace(`/admin/cities/${saved.id}`);
    } catch (error) {
      if (error instanceof ContentValidationError && error.field) {
        form.setError(error.field as "slug", { message: error.message }, { shouldFocus: true });
      } else {
        toast.error("Couldn't save the city", { description: (error as Error).message });
      }
    }
  }

  return (
    <EditorShell
      form={form}
      noun="city"
      isNew={isNew}
      saving={save.isPending}
      onSubmit={onSubmit}
      updatedAt={city?.updatedAt}
      title={isNew ? "New city" : city.name.en || "Untitled city"}
      description={isNew ? "Add a city or region Driveo operates in. It appears on the Cities page and in the booking form." : undefined}
      breadcrumbs={[{ label: "Cities", href: "/admin/cities" }]}
      onDelete={
        city
          ? async () => {
              await remove.mutateAsync(city.id);
              toast.success(`"${city.name.en}" deleted`);
              router.push("/admin/cities");
            }
          : undefined
      }
    >
      <Card>
        <CardHeader title="City" description="Shown on the Cities page, in the footer and in the booking form." />
        <CardBody className="sm:grid-cols-2">
          <LocalizedField name="name" label="City or region name" required maxLength={40} placeholder="London" />
          <SlugField source="name.en" prefix="/cities#" autoFollow={isNew} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Services offered" description="Listed on the city's card on the website." />
        <CardBody>
          <CheckboxCards
            name="serviceIds"
            options={services.map((service) => ({
              id: service.id,
              label: service.title.en,
              detail: service.status === "draft" ? "Draft — not shown on the website yet" : service.label.en,
            }))}
          />
          {form.formState.errors.serviceIds?.message && (
            <p role="alert" className="text-xs font-medium text-danger">
              {form.formState.errors.serviceIds.message}
            </p>
          )}
        </CardBody>
      </Card>
    </EditorShell>
  );
}
