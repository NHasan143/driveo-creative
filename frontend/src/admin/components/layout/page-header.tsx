import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Parent pages, e.g. [{ label: "Services", href: "/admin/services" }]. */
  breadcrumbs?: { label: string; href: string }[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1">
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
                <ChevronRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-[1.75rem] leading-tight font-medium text-foreground">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
