import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import { CheckList } from "@/components/ui/check-list";
import type { Dictionary } from "@/i18n/get-dictionary";

/** What the booking form asks for, so visitors can prepare before they start. */
export function RequestChecklist({ page }: { page: Dictionary["pages"]["process"] }) {
  return (
    <section className="section-band bg-secondary">
      <div className="site-shell">
        <SectionHeading eyebrow={page.checklistEyebrow} title={page.checklistTitle} intro={page.checklistIntro} />
        <Reveal className="mt-12 rounded-lg border border-border bg-background/60 p-8 sm:p-10">
          <CheckList items={page.checklist} className="gap-5 md:grid-cols-2 md:gap-x-12" />
        </Reveal>
      </div>
    </section>
  );
}
