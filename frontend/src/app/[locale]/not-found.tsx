import { BrandMark } from "@/components/brand/brand-mark";
import { buttonClassName } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const locale = await getLocale();
  const { notFound } = await getDictionary(locale);

  return (
    <main className="grid min-h-svh place-items-center bg-background px-6">
      <div className="max-w-xl">
        <BrandMark size="md" className="mb-8" />
        <Eyebrow>{notFound.eyebrow}</Eyebrow>
        <h1 className="section-title">{notFound.title}</h1>
        <p className="mt-6 leading-7 text-muted-foreground">{notFound.body}</p>
        {/* Plain anchor: a full load resets any client state from the broken route. */}
        <a href={localePath(locale)} className={buttonClassName({}, "mt-8")}>
          {notFound.cta}
        </a>
      </div>
    </main>
  );
}
