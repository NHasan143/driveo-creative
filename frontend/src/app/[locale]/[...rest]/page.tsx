import { notFound } from "next/navigation";

/** Routes every unknown path under a locale to the localized 404 page. */
export default function CatchAllPage() {
  notFound();
}
