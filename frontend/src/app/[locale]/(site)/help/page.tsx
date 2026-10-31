import { ArrowRight, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { BookCta } from "@/components/page/book-cta";
import { FaqList } from "@/components/page/faq-list";
import { PageBanner } from "@/components/page/page-banner";
import { PageSection } from "@/components/page/page-section";
import { siteConfig } from "@/config/site";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PATH = "/help";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { help } = await getDictionary(locale);
  return buildPageMetadata(locale, help.meta, PATH);
}

export default async function HelpPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const help = t.help;

  const contacts = [
    { label: help.call, value: siteConfig.contact.phone, href: siteConfig.contact.phoneHref, Icon: Phone, external: false },
    { label: help.email, value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}`, Icon: Mail, external: false },
    { label: help.whatsapp, value: siteConfig.contact.phone, href: siteConfig.contact.whatsappHref, Icon: WhatsAppIcon, external: true },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageBanner
        locale={locale}
        title={help.title}
        intro={help.intro}
        crumbs={[{ label: t.pages.breadcrumbHome, path: "/" }, { label: t.nav.help }]}
      />

      <PageSection title={help.faqTitle}>
        <FaqList items={help.faqs.map((faq) => ({ question: faq.q, answer: faq.a }))} />
      </PageSection>

      <PageSection title={help.contactTitle} intro={t.footer.contactNote} tone="tinted">
        <ul className="grid gap-5 sm:grid-cols-3">
          {contacts.map(({ label, value, href, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="mt-5 font-display text-xl font-medium">{label}</span>
                <span className="mt-1 text-sm text-muted-foreground" dir="ltr">
                  {value}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title={help.manageTitle} intro={help.manageCopy}>
        <Link
          href={localePath(locale, "/account")}
          className="inline-flex items-center gap-2 rounded-full border border-input px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          {t.nav.signIn} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
      </PageSection>

      <BookCta locale={locale} title={t.booking.title} intro={t.booking.intro} cta={t.nav.book} />
    </main>
  );
}
