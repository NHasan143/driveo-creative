import type { Metadata } from "next";
import { CityEditor } from "@/admin/features/cities/city-editor";

export const metadata: Metadata = { title: "New city" };

export default function NewCityPage() {
  return <CityEditor city={null} />;
}
