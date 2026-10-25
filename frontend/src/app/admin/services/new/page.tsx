import type { Metadata } from "next";
import { ServiceEditor } from "@/admin/features/services/service-editor";

export const metadata: Metadata = { title: "New service" };

export default function NewServicePage() {
  return <ServiceEditor service={null} />;
}
