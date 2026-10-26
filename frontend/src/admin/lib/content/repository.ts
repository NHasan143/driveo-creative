import type { City, ContentSnapshot, Service, Vehicle } from "./types";

export type CollectionName = "services" | "vehicles" | "cities";

export interface CollectionItem {
  services: Service;
  vehicles: Vehicle;
  cities: City;
}

/** Fields the server owns; forms never send them. */
export type Draft<T> = Omit<T, "id" | "order" | "updatedAt"> & { id?: string };

/** Raised for input the store rejects, e.g. a slug already in use. Carries a field for the form. */
export class ContentValidationError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "ContentValidationError";
  }
}

/**
 * Everything the admin reads and writes. Today it is backed by the browser
 * (local-repository.ts); the Django REST API will implement the same contract.
 */
export interface ContentRepository {
  list<C extends CollectionName>(collection: C): Promise<CollectionItem[C][]>;
  get<C extends CollectionName>(collection: C, id: string): Promise<CollectionItem[C] | null>;
  /** Creates when `draft.id` is missing, otherwise updates. Returns the saved record. */
  save<C extends CollectionName>(collection: C, draft: Draft<CollectionItem[C]>): Promise<CollectionItem[C]>;
  remove(collection: CollectionName, id: string): Promise<void>;
  /** Persists a new display order; `ids` lists every item in the collection. */
  reorder(collection: CollectionName, ids: string[]): Promise<void>;
  snapshot(): Promise<ContentSnapshot>;
}
