"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useController, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { EditorShell } from "@/admin/components/form/editor-shell";
import { ImageField } from "@/admin/components/form/image-field";
import { LocalizedField } from "@/admin/components/form/localized-field";
import { OrderedPicker } from "@/admin/components/form/pickers";
import { Repeater } from "@/admin/components/form/repeater";
import { SeoPreview } from "@/admin/components/form/seo-preview";
import { SlugField } from "@/admin/components/form/slug-field";
import { Field } from "@/admin/components/ui/field";
import { Card, CardBody, CardHeader } from "@/admin/components/ui/primitives";
import { useCollection, useRemoveItem, useSaveItem } from "@/admin/lib/content/hooks";
import { ContentValidationError } from "@/admin/lib/content/repository";
import { emptyLocalized, SERVICE_ICONS, type Service } from "@/admin/lib/content/types";
import { cn } from "@/admin/lib/cn";
import { SERVICE_ICON_COMPONENTS } from "./service-icons";
import { ServicePrices } from "./service-prices";
import { serviceSchema, toServiceForm, type ServiceFormValues } from "./service-schema";

function IconPicker() {
  const { control } = useFormContext<ServiceFormValues>();
  const { field } = useController({ control, name: "icon" });
  return (
    <Field label="Icon" hint="Shown in the website's Services menu and on cards.">
      <div role="radiogroup" aria-label="Icon" className="flex flex-wrap gap-2">
        {SERVICE_ICONS.map((icon) => {
          const { Icon, label } = SERVICE_ICON_COMPONENTS[icon];
          const selected = field.value === icon;
          return (
            <button
              key={icon}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label}
              title={label}
              onClick={() => field.onChange(icon)}
              className={cn(
                "grid size-10 cursor-pointer place-items-center rounded-lg border transition-colors",
                selected ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-muted-foreground hover:bg-surface-muted",
              )}
            >
              <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </Field>
  );
}

const newTitledCopy = () => ({ title: emptyLocalized(), copy: emptyLocalized() });

export function ServiceEditor({ service }: { service: Service | null }) {
  const router = useRouter();
  const isNew = !service;
  const save = useSaveItem("services");
  const remove = useRemoveItem("services");
  const { data: vehicles = [] } = useCollection("vehicles");
  const { data: cities = [] } = useCollection("cities");

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: toServiceForm(service),
    mode: "onTouched",
  });

  async function onSubmit(values: ServiceFormValues) {
    try {
      const saved = await save.mutateAsync(values);
      form.reset(toServiceForm(saved));
      toast.success(isNew ? "Service created" : "Changes saved", {
        description: saved.status === "draft" ? "It's a draft, so it isn't shown on the website yet." : undefined,
      });
      if (isNew) router.replace(`/admin/services/${saved.id}`);
    } catch (error) {
      if (error instanceof ContentValidationError && error.field) {
        form.setError(error.field as "slug", { message: error.message }, { shouldFocus: true });
      } else {
        toast.error("Couldn't save the service", { description: (error as Error).message });
      }
    }
  }

  const usedIn = service ? cities.filter((city) => city.serviceIds.includes(service.id)) : [];

  return (
    <EditorShell
      form={form}
      noun="service"
      isNew={isNew}
      saving={save.isPending}
      onSubmit={onSubmit}
      updatedAt={service?.updatedAt}
      title={isNew ? "New service" : service.title.en || "Untitled service"}
      description={isNew ? "Add a service to the website. Save it as a draft until it's ready." : undefined}
      breadcrumbs={[{ label: "Services", href: "/admin/services" }]}
      onDelete={
        service
          ? async () => {
              await remove.mutateAsync(service.id);
              toast.success(`"${service.title.en}" deleted`);
              router.push("/admin/services");
            }
          : undefined
      }
      deleteWarning={
        usedIn.length > 0 ? (
          <p className="mt-2">
            It will also be removed from {usedIn.length} {usedIn.length === 1 ? "city" : "cities"}:{" "}
            {usedIn.map((city) => city.name.en).join(", ")}.
          </p>
        ) : undefined
      }
    >
      <Card>
        <CardHeader title="Basics" description="Shown on service cards, the Services page and in the menu." />
        <CardBody>
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <LocalizedField name="title" label="Service name" required maxLength={60} placeholder="Airport transfer" />
            <LocalizedField name="label" label="Category label" required maxLength={30} placeholder="Transfer" hint="A one-word tag above the name." />
          </div>
          <LocalizedField
            name="summary"
            label="Short description"
            required
            multiline
            rows={3}
            maxLength={320}
            hint="One or two sentences. Appears on cards and at the top of the service page."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SlugField source="title.en" prefix="/services/" autoFollow={isNew} />
            <IconPicker />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Service page" description="The detail page at the top of the site's Services section." />
        <CardBody>
          <LocalizedField name="headline" label="Page headline" required maxLength={90} placeholder="Airport transfers, timed to your flight." />
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField name="heroImage" label="Header photo" required hint="Wide photo behind the headline." aspect="16 / 9" />
            <ImageField name="overviewImage" label="Overview photo" required hint="Portrait-style photo next to the overview." aspect="4 / 3" />
          </div>
          <LocalizedField name="overviewTitle" label="Overview heading" required maxLength={90} />
          <LocalizedField name="overviewBody" label="Overview text" required multiline rows={5} maxLength={700} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Key facts" description="Big-number highlights. The first three also appear in the page's summary card." />
        <CardBody>
          <Repeater
            name="facts"
            itemLabel="fact"
            max={6}
            createItem={() => ({ value: emptyLocalized(), label: emptyLocalized() })}
            emptyText="No facts yet. Four short, true facts work best, e.g. “60 min” · “Complimentary waiting”."
            renderItem={(index) => (
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <LocalizedField name={`facts.${index}.value`} label="Value" required maxLength={16} placeholder="60 min" />
                <LocalizedField name={`facts.${index}.label`} label="Label" required maxLength={60} placeholder="Complimentary waiting" />
              </div>
            )}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="What's included" description="Bullet points on the Services page." />
        <CardBody>
          <Repeater
            name="included"
            itemLabel="item"
            max={8}
            createItem={emptyLocalized}
            emptyText="Nothing listed yet."
            renderItem={(index) => <LocalizedField name={`included.${index}`} label="Included item" required maxLength={90} />}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Features" description="Shown with check marks beside the overview photo." />
        <CardBody>
          <Repeater
            name="features"
            itemLabel="feature"
            max={8}
            createItem={newTitledCopy}
            emptyText="No features yet. Four work best."
            renderItem={(index) => (
              <>
                <LocalizedField name={`features.${index}.title`} label="Title" required maxLength={80} />
                <LocalizedField name={`features.${index}.copy`} label="Description" required multiline rows={2} maxLength={220} />
              </>
            )}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="How it works" description="Numbered steps from request to arrival." />
        <CardBody>
          <Repeater
            name="steps"
            itemLabel="step"
            max={6}
            createItem={newTitledCopy}
            emptyText="No steps yet. Three is the usual number."
            renderItem={(index) => (
              <>
                <LocalizedField name={`steps.${index}.title`} label="Step title" required maxLength={80} />
                <LocalizedField name={`steps.${index}.copy`} label="Description" required multiline rows={2} maxLength={220} />
              </>
            )}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recommended vehicles" description="Shown on the service page, in this order." />
        <CardBody>
          <OrderedPicker
            name="vehicleIds"
            emptyText="No vehicles chosen. Add at least one so visitors can request a quote for it."
            options={vehicles.map((vehicle) => ({
              id: vehicle.id,
              label: vehicle.name.en,
              detail: `${vehicle.model} · up to ${vehicle.passengers} passengers${vehicle.status === "draft" ? " · draft" : ""}`,
            }))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Prices"
          description="Guide prices in euros. The website shows the lowest as “From €…” and the quote form shows the price for the chosen car and city. Customers still receive a fixed quote. Leave a cell empty where you don't offer that car."
        />
        <CardBody>
          <ServicePrices serviceId={service?.id} cities={cities} vehicles={vehicles} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Search engines" description="Optional. Leave empty to use the service name and short description." />
        <CardBody>
          <LocalizedField name="seoTitle" label="Page title" maxLength={70} />
          <LocalizedField name="seoDescription" label="Meta description" multiline rows={2} maxLength={170} />
          <SeoPreview titleFallback="title" descriptionFallback="summary" path={(slug) => `/services/${slug}`} />
        </CardBody>
      </Card>
    </EditorShell>
  );
}
