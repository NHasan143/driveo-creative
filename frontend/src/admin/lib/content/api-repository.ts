import { adminRequest, NotFoundError } from "@/admin/lib/admin-api";
import type { CollectionItem, CollectionName, ContentRepository, Draft } from "./repository";
import type { ContentSnapshot } from "./types";

/**
 * Django REST API implementation (backend/content/), used when
 * NEXT_PUBLIC_ADMIN_CONTENT_SOURCE=api. Every call needs a signed-in staff
 * member; the admin shows its sign-in screen otherwise.
 *
 * Endpoints, relative to NEXT_PUBLIC_API_BASE_URL:
 *   /v1/content/{services|vehicles|cities}/          GET list · POST create
 *   /v1/content/{services|vehicles|cities}/{id}/     GET · PUT · DELETE
 *   /v1/content/{services|vehicles|cities}/reorder/  POST { ids }
 *   /v1/content/snapshot/                            GET
 *   /v1/content/images/                              POST multipart `file` → { url }
 */

const base = (collection: CollectionName) => `/v1/content/${collection}/`;
const item = (collection: CollectionName, id: string) => `${base(collection)}${encodeURIComponent(id)}/`;

/** Photos picked in the form are data URLs until saved; the API stores them in object storage first. */
async function uploadPhotos<T>(value: T): Promise<T> {
  if (typeof value === "string" && value.startsWith("data:image/")) {
    const blob = await (await fetch(value)).blob();
    const body = new FormData();
    body.append("file", blob, `photo.${blob.type.split("/")[1] ?? "jpg"}`);
    const { url } = await adminRequest<{ url: string }>("/v1/content/images/", { method: "POST", body });
    return url as T;
  }
  if (Array.isArray(value)) return (await Promise.all(value.map(uploadPhotos))) as T;
  if (typeof value === "object" && value !== null) {
    const entries = await Promise.all(Object.entries(value).map(async ([key, entry]) => [key, await uploadPhotos(entry)]));
    return Object.fromEntries(entries) as T;
  }
  return value;
}

export const apiRepository: ContentRepository = {
  list(collection) {
    return adminRequest(base(collection));
  },

  async get<C extends CollectionName>(collection: C, id: string) {
    try {
      return await adminRequest<CollectionItem[C]>(item(collection, id));
    } catch (error) {
      // The editors show their own "not found" state for a missing record.
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  },

  async save<C extends CollectionName>(collection: C, draft: Draft<CollectionItem[C]>) {
    const body = await uploadPhotos(draft);
    return draft.id
      ? adminRequest<CollectionItem[C]>(item(collection, draft.id), { method: "PUT", body })
      : adminRequest<CollectionItem[C]>(base(collection), { method: "POST", body });
  },

  async remove(collection, id) {
    await adminRequest(item(collection, id), { method: "DELETE" });
  },

  async reorder(collection, ids) {
    await adminRequest(`${base(collection)}reorder/`, { method: "POST", body: { ids } });
  },

  snapshot() {
    return adminRequest<ContentSnapshot>("/v1/content/snapshot/");
  },
};
