import { notFound } from "next/navigation";

// This segment only ever throws notFound(), so there is nothing for instant validation to check.
export const instant = false;

/** Unknown /admin/* URLs get the admin's 404 instead of falling through to the website. */
export default function AdminCatchAll() {
  notFound();
}
