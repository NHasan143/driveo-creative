"use client";

import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Button } from "@/admin/components/ui/button";
import { Card, EmptyState, Skeleton } from "@/admin/components/ui/primitives";
import { useItem } from "@/admin/lib/content/hooks";
import type { CollectionItem, CollectionName } from "@/admin/lib/content/repository";

interface ItemLoaderProps<C extends CollectionName> {
  collection: C;
  noun: string;
  backHref: string;
  children: (item: CollectionItem[C]) => ReactNode;
}

function LoadingState({ noun }: { noun: string }) {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label={`Loading ${noun}`}>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-10 w-96 max-w-full rounded-xl" />
      <div className="grid gap-6 xl:grid-cols-[1fr_19rem]">
        <div className="grid gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

/** Reads `[id]` from the URL, loads the record and renders its editor, with loading and not-found states. */
export function ItemLoader<C extends CollectionName>(props: ItemLoaderProps<C>) {
  // `[id]` is only known at request time, so the prerendered shell shows the loading state.
  return (
    <Suspense fallback={<LoadingState noun={props.noun} />}>
      <ItemLoaderContent {...props} />
    </Suspense>
  );
}

function ItemLoaderContent<C extends CollectionName>({ collection, noun, backHref, children }: ItemLoaderProps<C>) {
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useItem(collection, id);

  if (isPending) {
    return <LoadingState noun={noun} />;
  }

  if (!data) {
    return (
      <Card>
        <EmptyState
          icon={<FileQuestion />}
          title={`This ${noun} doesn't exist`}
          description="It may have been deleted, or the link is out of date."
          action={
            <Button asChild>
              <Link href={backHref}>Back to the list</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  // Keyed so switching between records always starts a fresh form.
  return <div key={data.id}>{children(data)}</div>;
}
