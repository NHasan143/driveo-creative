import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

export function TestimonialSection({ testimonial }: { testimonial: Dictionary["testimonial"] }) {
  return (
    <section className="bg-background py-20 sm:py-32">
      <Reveal className="site-shell">
        <Eyebrow>{testimonial.eyebrow}</Eyebrow>
        <blockquote className="mt-8 max-w-[26ch] font-display text-[clamp(2.4rem,5vw,4.7rem)] leading-[1.04]">
          {testimonial.quote}
        </blockquote>
        <p className="mono-label mt-8">{testimonial.note}</p>
      </Reveal>
    </section>
  );
}
