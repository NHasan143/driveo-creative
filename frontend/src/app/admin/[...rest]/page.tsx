import { notFound } from "next/navigation";

/** Unknown /admin/* URLs get the admin's 404 instead of falling through to the website. */
export default function AdminCatchAll() {
  notFound();
}
