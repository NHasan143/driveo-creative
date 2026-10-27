"use client";

import { ItemLoader } from "@/admin/components/content/item-loader";
import { CityEditor } from "@/admin/features/cities/city-editor";
import { AuthGate } from "@/admin/components/auth/auth-gate";

export default function EditCityPage() {
  return (
    <AuthGate>
      <ItemLoader collection="cities" noun="city" backHref="/admin/cities">
        {(city) => <CityEditor city={city} />}
      </ItemLoader>
    </AuthGate>
  );
}
