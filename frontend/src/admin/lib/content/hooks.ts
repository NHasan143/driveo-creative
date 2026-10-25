"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repository } from ".";
import type { CollectionItem, CollectionName, Draft } from "./repository";
import type { SiteSettings } from "./types";

/** Query keys. Every write invalidates `["content"]`, so all screens stay in sync. */
export const contentKeys = {
  all: ["content"] as const,
  list: (collection: CollectionName) => ["content", collection] as const,
  item: (collection: CollectionName, id: string) => ["content", collection, id] as const,
  settings: ["content", "settings"] as const,
};

export function useCollection<C extends CollectionName>(collection: C) {
  return useQuery({
    queryKey: contentKeys.list(collection),
    queryFn: () => repository.list(collection),
  });
}

export function useItem<C extends CollectionName>(collection: C, id: string | undefined) {
  return useQuery({
    queryKey: contentKeys.item(collection, id ?? "new"),
    queryFn: () => repository.get(collection, id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateContent() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: contentKeys.all });
}

export function useSaveItem<C extends CollectionName>(collection: C) {
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: (draft: Draft<CollectionItem[C]>) => repository.save(collection, draft),
    onSuccess: invalidate,
  });
}

export function useRemoveItem(collection: CollectionName) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repository.remove(collection, id),
    // Skip the deleted item's own query: refetching it would flash "not found" in the
    // editor that is about to navigate away. It is garbage-collected once unmounted.
    onSuccess: (_result, id) => {
      const deleted = contentKeys.item(collection, id).join("/");
      return queryClient.invalidateQueries({
        queryKey: contentKeys.all,
        predicate: (query) => query.queryKey.join("/") !== deleted,
      });
    },
  });
}

export function useReorder(collection: CollectionName) {
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: (ids: string[]) => repository.reorder(collection, ids),
    onSuccess: invalidate,
  });
}

export function useSettings() {
  return useQuery({ queryKey: contentKeys.settings, queryFn: () => repository.getSettings() });
}

export function useSaveSettings() {
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: (settings: Omit<SiteSettings, "updatedAt">) => repository.saveSettings(settings),
    onSuccess: invalidate,
  });
}

export function useResetContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => repository.reset(),
    onSuccess: () => queryClient.resetQueries({ queryKey: contentKeys.all }),
  });
}
