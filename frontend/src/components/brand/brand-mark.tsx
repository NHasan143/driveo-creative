import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const sizes = {
  sm: "size-12",
  md: "size-[4.5rem]",
  lg: "size-[4.5rem] sm:size-[6.25rem]",
} as const;

interface BrandMarkProps {
  size?: keyof typeof sizes;
  priority?: boolean;
  className?: string;
}

export function BrandMark({ size = "sm", priority = false, className }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "relative block flex-none overflow-hidden rounded-sm border border-primary/40 bg-background",
        "shadow-[0_10px_30px_color-mix(in_oklab,var(--background)_60%,transparent)]",
        sizes[size],
        className,
      )}
    >
      <Image
        src={siteConfig.assets.logo}
        alt={siteConfig.shortName}
        fill
        sizes="100px"
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}
