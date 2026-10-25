"use client";

import { ItemLoader } from "@/admin/components/content/item-loader";
import { CityEditor } from "@/admin/features/cities/city-editor";

export default function EditCityPage() {
  return (
    <ItemLoader collection="cities" noun="city" backHref="/admin/cities">
      {(city) => <CityEditor city={city} />}
    </ItemLoader>
  );
}
