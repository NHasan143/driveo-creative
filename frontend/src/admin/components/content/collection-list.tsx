"use client";

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/admin/components/ui/button";
import { ConfirmDialog } from "@/admin/components/ui/confirm-dialog";
import { Input, Select } from "@/admin/components/ui/input";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/admin/components/ui/menu";
import { Badge, Card, EmptyState, Skeleton } from "@/admin/components/ui/primitives";
import { useCollection, useRemoveItem, useReorder, useSaveItem } from "@/admin/lib/content/hooks";
import type { CollectionItem, CollectionName, Draft } from "@/admin/lib/content/repository";
import { formatRelative } from "@/admin/lib/format";
import { TranslationDots } from "./translation-dots";

interface CollectionListProps<C extends CollectionName> {
  collection: C;
  /** Singular noun, e.g. "service". */
  noun: string;
  basePath: string;
  emptyIcon: ReactNode;
  emptyDescription: string;
  /** Main cell: thumbnail, name and secondary line. */
  renderPrimary: (item: CollectionItem[C]) => ReactNode;
  /** Optional extra column, e.g. capacity for vehicles. */
  extraColumn?: { label: string; render: (item: CollectionItem[C]) => ReactNode };
  /** Text the search box matches against. */
  searchText: (item: CollectionItem[C]) => string;
  displayName: (item: CollectionItem[C]) => string;
  /** Explains what else changes when an item is deleted (references removed). */
  deleteWarning?: (item: CollectionItem[C]) => ReactNode;
  /** Builds the copy saved by "Duplicate". */
  duplicate: (item: CollectionItem[C]) => Draft<CollectionItem[C]>;
}

type StatusFilter = "all" | "published" | "draft";

export function CollectionList<C extends CollectionName>({
  collection,
  noun,
  basePath,
  emptyIcon,
  emptyDescription,
  renderPrimary,
  extraColumn,
  searchText,
  displayName,
  deleteWarning,
  duplicate,
}: CollectionListProps<C>) {
  const router = useRouter();
  const { data: items, isPending, isError, refetch } = useCollection(collection);
  const save = useSaveItem(collection);
  const remove = useRemoveItem(collection);
  const reorder = useReorder(collection);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<CollectionItem[C] | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (items ?? []).filter(
      (item) =>
        (status === "all" || item.status === status) && (!needle || searchText(item).toLowerCase().includes(needle)),
    );
  }, [items, query, status, searchText]);

  // Reordering only makes sense on the full, unfiltered list.
  const canReorder = !query && status === "all";

  async function move(index: number, direction: -1 | 1) {
    if (!items) return;
    const ids = items.map((item) => item.id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + direction, 0, id);
    await reorder.mutateAsync(ids);
  }

  async function toggleStatus(item: CollectionItem[C]) {
    const next = item.status === "published" ? "draft" : "published";
    await save.mutateAsync({ ...item, status: next });
    toast.success(next === "published" ? `"${displayName(item)}" is now published` : `"${displayName(item)}" moved to drafts`);
  }

  async function duplicateItem(item: CollectionItem[C]) {
    const copy = await save.mutateAsync(duplicate(item));
    toast.success(`Duplicated as a draft`, { description: "Opening the copy so you can edit it." });
    router.push(`${basePath}/${copy.id}`);
  }

  const publishedCount = items?.filter((item) => item.status === "published").length ?? 0;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-sm">
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${noun}s…`}
            aria-label={`Search ${noun}s`}
            className="ps-9"
          />
        </div>
        <div className="w-40">
          <Select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </Select>
        </div>
        {items && (
          <p className="ms-auto text-xs text-muted-foreground">
            {items.length} total · {publishedCount} published
          </p>
        )}
      </div>

      <Card className="overflow-hidden">
        {isPending ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={emptyIcon}
            title="Couldn't load this list"
            description="Something went wrong while reading the content."
            action={<Button onClick={() => refetch()}>Try again</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={`No ${noun}s yet`}
            description={emptyDescription}
            action={
              <Button asChild>
                <Link href={`${basePath}/new`}>
                  <Plus aria-hidden="true" />
                  New {noun}
                </Link>
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Search />}
            title="No matches"
            description="Try a different search or status filter."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <table className="w-full border-collapse text-start">
            <thead className="hidden bg-surface-muted/60 text-xs font-semibold text-muted-foreground md:table-header-group">
              <tr>
                {canReorder && <th className="w-16 px-3 py-2.5 text-start font-semibold"><span className="sr-only">Order</span></th>}
                <th className="px-5 py-2.5 text-start font-semibold">Name</th>
                {extraColumn && <th className="px-4 py-2.5 text-start font-semibold">{extraColumn.label}</th>}
                <th className="px-4 py-2.5 text-start font-semibold">Status</th>
                <th className="hidden px-4 py-2.5 text-start font-semibold lg:table-cell">Languages</th>
                <th className="hidden px-4 py-2.5 text-start font-semibold lg:table-cell">Updated</th>
                <th className="w-14 px-3 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((item, index) => (
                <tr key={item.id} className="group grid grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-3 transition-colors hover:bg-surface-muted/40 md:table-row md:p-0">
                  {canReorder && (
                    <td className="hidden px-3 md:table-cell">
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon-sm" className="h-6" aria-label={`Move ${displayName(item)} up`} disabled={index === 0 || reorder.isPending} onClick={() => move(index, -1)}>
                          <ArrowUp aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="h-6" aria-label={`Move ${displayName(item)} down`} disabled={index === visible.length - 1 || reorder.isPending} onClick={() => move(index, 1)}>
                          <ArrowDown aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  )}
                  <td className="min-w-0 md:px-5 md:py-3">
                    <Link href={`${basePath}/${item.id}`} className="block rounded-md focus-visible:outline-offset-4">
                      {renderPrimary(item)}
                    </Link>
                  </td>
                  {extraColumn && (
                    <td className="col-start-1 mt-2 text-sm text-muted-foreground md:mt-0 md:px-4">{extraColumn.render(item)}</td>
                  )}
                  <td className="col-start-1 mt-2 md:mt-0 md:px-4">
                    <Badge tone={item.status === "published" ? "success" : "neutral"} dot>
                      {item.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="hidden px-4 lg:table-cell">
                    <TranslationDots record={item} />
                  </td>
                  <td className="hidden px-4 text-xs whitespace-nowrap text-muted-foreground lg:table-cell">
                    {formatRelative(item.updatedAt)}
                  </td>
                  <td className="col-start-2 row-span-3 row-start-1 md:px-3">
                    <Menu>
                      <MenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${displayName(item)}`}>
                          <MoreHorizontal aria-hidden="true" />
                        </Button>
                      </MenuTrigger>
                      <MenuContent>
                        <MenuItem onSelect={() => router.push(`${basePath}/${item.id}`)}>
                          <Pencil aria-hidden="true" /> Edit
                        </MenuItem>
                        <MenuItem onSelect={() => toggleStatus(item)}>
                          {item.status === "published" ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                          {item.status === "published" ? "Unpublish" : "Publish"}
                        </MenuItem>
                        <MenuItem onSelect={() => duplicateItem(item)}>
                          <Copy aria-hidden="true" /> Duplicate
                        </MenuItem>
                        {canReorder && (
                          <>
                            <MenuSeparator />
                            <MenuItem disabled={index === 0 || reorder.isPending} onSelect={() => move(index, -1)}>
                              <ArrowUp aria-hidden="true" /> Move up
                            </MenuItem>
                            <MenuItem disabled={index === visible.length - 1 || reorder.isPending} onSelect={() => move(index, 1)}>
                              <ArrowDown aria-hidden="true" /> Move down
                            </MenuItem>
                          </>
                        )}
                        <MenuSeparator />
                        <MenuItem tone="danger" onSelect={() => setPendingDelete(item)}>
                          <Trash2 aria-hidden="true" /> Delete
                        </MenuItem>
                      </MenuContent>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {canReorder && items && items.length > 1 && (
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="hidden md:inline">Use the arrows to change the order shown on the website.</span>
          <span className="md:hidden">Use “Move up” and “Move down” in each item&apos;s menu to change the order shown on the website.</span>
        </p>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete ? displayName(pendingDelete) : ""}"?`}
        description={
          <>
            <p>It will be removed from the website. This can&apos;t be undone.</p>
            {pendingDelete && deleteWarning?.(pendingDelete)}
          </>
        }
        confirmLabel={`Delete ${noun}`}
        busy={remove.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const name = displayName(pendingDelete);
          await remove.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
          toast.success(`"${name}" deleted`);
        }}
      />
    </>
  );
}
