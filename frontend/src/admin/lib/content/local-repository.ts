import { get, set } from "idb-keyval";
import {
  ContentValidationError,
  type CollectionItem,
  type CollectionName,
  type ContentRepository,
  type Draft,
} from "./repository";
import { seed } from "./seed";
import type { ContentSnapshot } from "./types";

/**
 * Browser-only implementation, used until the Django API exists. Content lives
 * in IndexedDB (which, unlike localStorage, has room for uploaded photos) and
 * starts from the website's own copy (seed.ts).
 */

const STORAGE_KEY = "driveo-admin:content:v1";
/** A short delay keeps loading and saving states honest before a real network is involved. */
const LATENCY_MS = 180;

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
const clone = <T>(value: T): T => structuredClone(value);

let cache: ContentSnapshot | null = null;

async function load(): Promise<ContentSnapshot> {
  if (cache) return cache;
  const stored = await get<ContentSnapshot>(STORAGE_KEY);
  cache = stored ?? clone(seed);
  return cache;
}

async function persist(next: ContentSnapshot) {
  cache = next;
  await set(STORAGE_KEY, next);
}

/** Typed view of one collection inside a snapshot. */
function itemsOf<C extends CollectionName>(content: ContentSnapshot, collection: C) {
  return content[collection] as unknown as CollectionItem[C][];
}

function setItems<C extends CollectionName>(content: ContentSnapshot, collection: C, items: CollectionItem[C][]) {
  (content as unknown as Record<CollectionName, unknown>)[collection] = items;
}

function newId(slug: string) {
  return `${slug.replace(/-/g, "_")}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Removes references to a deleted record from the records that point at it. */
function detach(content: ContentSnapshot, collection: CollectionName, id: string) {
  if (collection === "services") {
    content.cities = content.cities.map((city) => ({
      ...city,
      serviceIds: city.serviceIds.filter((serviceId) => serviceId !== id),
    }));
  }
  if (collection === "vehicles") {
    content.services = content.services.map((service) => ({
      ...service,
      vehicleIds: service.vehicleIds.filter((vehicleId) => vehicleId !== id),
    }));
  }
}

export const localRepository: ContentRepository = {
  async list<C extends CollectionName>(collection: C) {
    await wait();
    const items = itemsOf(await load(), collection);
    return clone([...items].sort((a, b) => a.order - b.order));
  },

  async get<C extends CollectionName>(collection: C, id: string) {
    await wait();
    const item = itemsOf(await load(), collection).find((entry) => entry.id === id);
    return item ? clone(item) : null;
  },

  async save<C extends CollectionName>(collection: C, draft: Draft<CollectionItem[C]>) {
    await wait();
    const content = clone(await load());
    const items = itemsOf(content, collection);
    const slug = draft.slug.trim();

    if (items.some((item) => item.slug === slug && item.id !== draft.id)) {
      throw new ContentValidationError(`The URL slug "${slug}" is already used by another entry.`, "slug");
    }

    const existing = draft.id ? items.find((item) => item.id === draft.id) : undefined;
    const saved = {
      ...draft,
      slug,
      id: existing?.id ?? newId(slug),
      order: existing?.order ?? Math.max(-1, ...items.map((item) => item.order)) + 1,
      updatedAt: new Date().toISOString(),
    } as CollectionItem[C];

    setItems(content, collection, existing ? items.map((item) => (item.id === existing.id ? saved : item)) : [...items, saved]);
    await persist(content);
    return clone(saved);
  },

  async remove(collection, id) {
    await wait();
    const content = clone(await load());
    setItems(content, collection, itemsOf(content, collection).filter((item) => item.id !== id));
    detach(content, collection, id);
    await persist(content);
  },

  async reorder(collection, ids) {
    await wait();
    const content = clone(await load());
    const position = new Map(ids.map((id, index) => [id, index]));
    setItems(
      content,
      collection,
      itemsOf(content, collection).map((item) => ({ ...item, order: position.get(item.id) ?? item.order })),
    );
    await persist(content);
  },

  async snapshot() {
    return clone(await load());
  },
};
