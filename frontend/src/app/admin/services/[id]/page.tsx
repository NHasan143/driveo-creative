"use client";

import { ItemLoader } from "@/admin/components/content/item-loader";
import { ServiceEditor } from "@/admin/features/services/service-editor";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export default function EditServicePage() {
  return (
    <AuthGate>
      <ItemLoader collection="services" noun="service" backHref="/admin/services">
        {(service) => <ServiceEditor service={service} />}
      </ItemLoader>
    </AuthGate>
  );
}
