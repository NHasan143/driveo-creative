import Image from "next/image";
import { StarHalfIcon, StarIcon } from "@/components/icons/design-icons";
import { cn } from "@/lib/cn";
import { CardRail } from "./card-rail";
import { SectionIntro } from "./section-intro";

export interface Review {
  highlight: string;
  body: string;
  name: string;
  trip: string;
}

interface ReviewsSectionProps {
  badge: string;
  lead: string;
  accent: string;
  rating: string;
  ratingLabel: string;
  items: Review[];
  labels: { previous: string; next: string };
  className?: string;
}

const AVATARS = ["/media/site/people/review-1.jpg", "/media/site/people/review-2.jpg"];

function Stars({ label }: { label: string }) {
  return (
    <span role="img" aria-label={label} className="flex items-center gap-0.5">
      {[0, 1, 2, 3].map((index) => (
        <StarIcon key={index} className="size-4" />
      ))}
      <StarHalfIcon className="size-4 rtl:-scale-x-100" />
    </span>
  );
}

/** "Real journeys. thoughtful service": review cards on cream, every second one in ink. */
export function ReviewsSection({ badge, lead, accent, rating, ratingLabel, items, labels, className }: ReviewsSectionProps) {
  return (
    <section className={cn("section-band overflow-hidden bg-cream", className)}>
      <div className="site-shell">
        <CardRail
          labels={labels}
          header={<SectionIntro badge={badge} lead={lead} accent={accent} />}
          trackClassName="gap-4 xl:gap-[1.4375rem]"
        >
          {items.map((review, index) => {
            const dark = index % 3 === 1;
            return (
              <figure
                key={index}
                className={cn(
                  "flex w-[18.75rem] flex-col justify-between gap-8 rounded-[1.25rem] border p-5 sm:w-[22rem] xl:h-[21.9375rem] xl:w-[calc((100%-2.875rem)/3)] xl:p-6",
                  dark
                    ? "border-[#eaeaea] bg-ink"
                    : "border-[#eaeaea] bg-white shadow-[0_4px_8px_rgba(0,0,0,0.06)]",
                )}
              >
                <div className="flex flex-col gap-6 xl:gap-8">
                  <div className="flex items-center gap-2">
                    <Stars label={ratingLabel} />
                    <span
                      aria-hidden="true"
                      className={cn("text-base leading-[1.5] font-semibold tracking-[-0.03em]", dark ? "text-white" : "text-body")}
                    >
                      {rating}
                    </span>
                  </div>
                  <blockquote className="text-[0.9375rem] leading-[1.5] tracking-[-0.01em] xl:text-lg">
                    <strong className={cn("font-semibold", dark ? "text-white" : "text-ink")}>{review.highlight}</strong>{" "}
                    <span className={dark ? "text-[#c4c4c4]" : "text-ink"}>{review.body}</span>
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-[0.9375rem]">
                  <Image
                    src={AVATARS[dark ? 1 : 0]}
                    alt=""
                    width={56}
                    height={56}
                    className="size-11 shrink-0 rounded-xl object-cover xl:size-14"
                  />
                  <span className="flex flex-col gap-1.5">
                    <span className={cn("text-base leading-[1.1] font-medium tracking-[-0.02em] xl:text-lg", dark ? "text-white" : "text-ink")}>
                      {review.name}
                    </span>
                    <span className={cn("text-xs leading-[1.5] tracking-[-0.01em] xl:text-sm", dark ? "text-sand" : "text-muted-text")}>
                      {review.trip}
                    </span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </CardRail>
      </div>
    </section>
  );
}
