import Image from "next/image";
import { LogomarkIcon } from "@/components/icons/design-icons";
import { AppDownloadButtons } from "@/features/pwa/app-download-buttons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./section-intro";

interface AppSectionProps {
  copy: Dictionary["site"]["app"];
  install: Dictionary["install"];
}

function GlassTag({ children, className }: { children: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute flex h-11 items-center gap-2 rounded-xl border-2 border-[rgba(250,245,242,0.1)] bg-white/5 px-3.5 text-[0.6875rem] leading-[1.3] font-semibold tracking-[-0.03em] whitespace-nowrap text-[#faf5f2] backdrop-blur-[20px]",
        "xl:h-[4.0625rem] xl:rounded-2xl xl:px-6 xl:text-sm",
        className,
      )}
    >
      <LogomarkIcon className="size-5 shrink-0 xl:size-[1.8rem]" />
      {children}
    </span>
  );
}

/** "Your Ride, Made Simple.": app download over a blurred forest, with the rider photo on the right. */
export function AppSection({ copy, install }: AppSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-linen">
      <div aria-hidden="true" className="absolute -inset-[8%] -z-10 blur-[5px]">
        <Image src="/media/site/app/backdrop.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[rgba(25,22,18,0.6)]" />
      </div>

      <div className="site-shell grid xl:min-h-[43.25rem] xl:grid-cols-[29.1875rem_1fr]">
        <div className="flex flex-col gap-6 pt-8 xl:gap-[2.4rem] xl:self-center xl:pt-0 xl:pb-24">
          <div className="flex flex-col gap-3 xl:gap-[0.96rem]">
            <SectionHeading lead={copy.lead} accent={copy.accent} stacked tone="dark" />
            <p className="text-sm leading-[1.6] tracking-[-0.01em] text-cream-border xl:text-[0.9375rem]">{copy.body}</p>
          </div>
          <AppDownloadButtons
            labels={{ ios: copy.ios, android: copy.android, androidHelp: copy.androidHelp }}
            install={install}
          />
        </div>

        <div className="relative mx-auto mt-6 aspect-[840/780] w-full max-w-[33rem] self-end xl:absolute xl:top-0 xl:self-auto xl:bottom-[-5.5rem] xl:left-[calc(50%+18.75rem)] xl:mt-0 xl:w-auto xl:max-w-none xl:-translate-x-1/2 rtl:xl:right-[calc(50%+18.75rem)] rtl:xl:left-auto rtl:xl:translate-x-1/2">
          <div className="absolute top-[1.28%] bottom-0 left-0 w-[91.67%]">
            <Image
              src="/media/site/app/rider.webp"
              alt={copy.imageAlt}
              fill
              sizes="(min-width: 1280px) 770px, 90vw"
              className="object-contain object-bottom"
            />
          </div>
          <GlassTag className="top-[18.7%] left-[65.1%]">{copy.needRide}</GlassTag>
          <GlassTag className="top-[60.9%] left-[1.7%] bg-[rgba(25,22,18,0.05)] backdrop-blur-[6px]">{copy.onTrack}</GlassTag>
        </div>
      </div>
    </section>
  );
}
