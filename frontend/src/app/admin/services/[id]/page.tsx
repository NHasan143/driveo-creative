"use client";

import { ItemLoader } from "@/admin/components/content/item-loader";
import { ServiceEditor } from "@/admin/features/services/service-editor";

export default function EditServicePage() {
  return (
    <ItemLoader collection="services" noun="service" backHref="/admin/services">
      {(service) => <ServiceEditor service={service} />}
    </ItemLoader>
  );
}
