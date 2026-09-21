import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { ArrowRight, Check, ChevronDown, Download, Globe, LoaderCircle, Minus, Plus, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaSnapchatGhost, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitQuote } from "@/lib/quote.functions";
import { LanguageProvider, languages, useLanguage, type LanguageCode } from "@/lib/i18n";
import businessImage from "../assets/fleet-business-2026.jpg";
import firstImage from "../assets/fleet-first-2026-front.jpg";
import vanImage from "../assets/fleet-van-vle.jpg";
import logoAsset from "../assets/driveo-logo.jpg.asset.json";
import cityJourneyAsset from "../assets/driveo-city-journey.mp4.asset.json";
import sofiaDubaiAsset from "../assets/driveo-sofia-dubai.mp4.asset.json";
import journeyPosterAsset from "../assets/driveo-journey-poster.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Driveo Exclusive | Private Chauffeur Service" },
    { name: "description", content: "Fixed-price private chauffeur travel in London, Paris, Bulgaria and Dubai with vetted drivers and immaculate cars." },
    { property: "og:title", content: "Driveo Exclusive | Private Chauffeur Service" },
    { property: "og:description", content: "Arrive in absolute silence with discreet, fixed-price private chauffeur travel." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://driveo-creative-lab.lovable.app/" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  links: [{ rel: "canonical", href: "https://driveo-creative-lab.lovable.app/" }],
  scripts: [{
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://driveo-creative-lab.lovable.app/#business",
      name: "Driveo Exclusive Limited",
      description: "Fixed-price private chauffeur service with vetted drivers, flight tracking and immaculate black Mercedes-Benz cars.",
      url: "https://driveo-creative-lab.lovable.app/",
      telephone: "+44 330 043 0976",
      email: "driveolimited@gmail.com",
      priceRange: "$$$",
      areaServed: ["London", "Paris", "Bulgaria", "Dubai"],
      sameAs: [
        "https://www.linkedin.com/company/driveo-exclusive/",
        "https://www.tiktok.com/@driveo5",
        "https://www.snapchat.com/add/driveoexclusive",
        "https://www.instagram.com/driveoexclusive2023",
      ],
    }),
  }]}),
  component: IndexPage,
});

const whatsappUrl = "https://wa.me/443300430976?text=Hello%20Driveo%2C%20I%27d%20like%20to%20request%20a%20quote.";
const socialLinks = [
  ["LinkedIn", "https://www.linkedin.com/company/driveo-exclusive/", FaLinkedinIn],
  ["TikTok", "https://www.tiktok.com/@driveo5?_r=1&_t=ZN-99gCIvv8nNG", FaTiktok],
  ["Snapchat", "https://www.snapchat.com/add/driveoexclusive?share_id=ZqyRPPy5TU6mN8Zqs_vvfw&locale=en_GB", FaSnapchatGhost],
  ["Facebook", "https://www.facebook.com/share/1EXpHn5pkE/?mibextid=wwXIfr", FaFacebookF],
  ["Instagram", "https://www.instagram.com/driveoexclusive2023?stkn=MTd6dzF4em15b3k5bQ%3D%3D&utm_source=qr", FaInstagram],
] as const;
const fleetMedia = [
  [businessImage, "Mercedes-Benz E-Class · 2026"],
  [firstImage, "Mercedes-Benz S-Class · 2026"],
  [vanImage, "Mercedes-Benz VLE · Black"],
] as const;
const serviceValues = ["Airport transfer", "Point-to-point", "Hourly hire", "Private event"] as const;
const vehicleValues = ["Business Class", "First Class", "Business Van", "Please advise"] as const;
const cityValues = ["London", "Paris", "Bulgaria", "Dubai"] as const;
type VehicleClass = (typeof vehicleValues)[number];

function BrandMark({ className = "" }: { className?: string }) {
  return <span className={`brand-mark ${className}`}><img src={logoAsset.url} alt="Driveo" width={768} height={768} /></span>;
}
function HeroJourney({ label }: { label: string }) {
  const [chapter, setChapter] = useState(0);
  const journeys = [cityJourneyAsset.url, sofiaDubaiAsset.url];
  return <video key={chapter} className="hero-video" autoPlay muted playsInline preload="auto" poster={journeyPosterAsset.url} onEnded={() => setChapter((chapter + 1) % journeys.length)} aria-label={label}><source src={journeys[chapter]} type="video/mp4" /></video>;
}
function QuoteLink({ children, className = "button-primary" }: { children: React.ReactNode; className?: string }) {
  return <a href="#quote" className={className}>{children}</a>;
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return <span className="language-switch">
    <Globe aria-hidden="true" />
    <select aria-label={t.nav.language} value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
      {languages.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
    </select>
    <ChevronDown aria-hidden="true" />
  </span>;
}

type DeferredPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function InstallButton() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || window.localStorage.getItem("driveo-install-dismissed") === "1") {
      setHidden(true);
      return;
    }
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isSafari = /safari/.test(window.navigator.userAgent.toLowerCase()) && !/crios|chrome|fxios|firefox/.test(window.navigator.userAgent.toLowerCase());
    if (isIos && isSafari) {
      setCanInstall(true);
    }
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredPrompt);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      setShowHint(true);
    }
  }

  function dismiss() {
    setShowHint(false);
    setHidden(true);
    if (typeof window !== "undefined") window.localStorage.setItem("driveo-install-dismissed", "1");
  }

  if (hidden || !canInstall) return null;

  return (
    <>
      <button type="button" className="install-button" onClick={handleClick} aria-label={t.install.label} title={t.install.label}>
        <Download aria-hidden="true" />
        <span>{t.install.button}</span>
      </button>
      {showHint && (
        <div className="install-modal" role="dialog" aria-modal="true" aria-label={t.install.iosTitle} onClick={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
          <div className="install-modal-content">
            <button type="button" className="install-close" onClick={dismiss} aria-label={t.install.close}><X aria-hidden="true" /></button>
            <h3>{t.install.iosTitle}</h3>
            <p>{t.install.iosBody}</p>
          </div>
        </div>
      )}
    </>
  );
}

function NumberStepper({ label, name, value, min, max, onChange }: { label: string; name: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const { t } = useLanguage();
  const atMax = value >= max;
  const atMin = value <= min;
  return <div className="stepper-field"><span>{label}</span><span className="number-stepper"><Button type="button" variant="ghost" size="icon" onClick={() => { if (!atMin) onChange(Math.max(min, value - 1)); }} disabled={atMin} aria-disabled={atMin} aria-label={`${t.quote.decrease} ${label}`}><Minus /></Button><strong aria-live="polite">{value}</strong><Button type="button" variant="ghost" size="icon" onClick={() => { if (!atMax) onChange(Math.min(max, value + 1)); }} disabled={atMax} aria-disabled={atMax} aria-label={`${t.quote.increase} ${label}`}><Plus /></Button><input type="hidden" name={name} value={value} /></span><small>{t.quote.max} {max}</small></div>;
}

function QuoteForm({ selectedVehicle, onVehicleChange }: { selectedVehicle: VehicleClass; onVehicleChange: (vehicle: VehicleClass) => void }) {
  const { t } = useLanguage();
  const submitQuoteFn = useServerFn(submitQuote);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const passengerLimit = selectedVehicle === "Business Van" ? 7 : 4;
  const luggageLimit = selectedVehicle === "Business Van" ? 8 : 3;

  function changeVehicle(vehicle: VehicleClass) {
    onVehicleChange(vehicle);
    const nextPassengerLimit = vehicle === "Business Van" ? 7 : 4;
    const nextLuggageLimit = vehicle === "Business Van" ? 8 : 3;
    setPassengers((value) => Math.min(value, nextPassengerLimit));
    setLuggage((value) => Math.min(value, nextLuggageLimit));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setState("sending");
    const values = new FormData(form);
    try {
      const result = await submitQuoteFn({ data: {
        fullName: String(values.get("fullName") ?? ""), email: String(values.get("email") ?? ""),
        phone: String(values.get("phone") ?? ""), serviceType: String(values.get("serviceType") ?? "") as "Airport transfer",
        pickupCity: String(values.get("pickupCity") ?? "") as "London",
        pickupLocation: String(values.get("pickupLocation") ?? ""), destination: String(values.get("destination") ?? ""),
        hireHours: serviceType === "Hourly hire" ? Number(values.get("hireHours")) : null,
        journeyDate: String(values.get("journeyDate") ?? ""), journeyTime: String(values.get("journeyTime") ?? ""),
        passengers: Math.min(Number(values.get("passengers") ?? 1), passengerLimit), vehicleClass: String(values.get("vehicleClass") ?? "") as VehicleClass,
        luggage: Math.min(Number(values.get("luggage") ?? 0), luggageLimit),
        notes: String(values.get("notes") ?? ""), company: String(values.get("company") ?? ""),
      }});
      setReference(result.reference); setState("sent"); formRef.current?.reset();
    } catch { setState("error"); }
  }

  if (state === "sent") return <div className="quote-success" role="status"><span><Check /></span><p className="eyebrow">{t.quote.successEyebrow}</p><h3>{t.quote.successTitle}</h3><p>{t.quote.successBodyBefore}<strong>{reference}</strong>{t.quote.successBodyAfter}</p><Button className="quote-submit" onClick={() => setState("idle")}>{t.quote.again}</Button></div>;

  return <form ref={formRef} className="quote-form" onSubmit={handleSubmit}>
    <input className="quote-trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <div className="form-grid">
      <label><span>{t.quote.fullName}</span><Input name="fullName" autoComplete="name" required minLength={2} maxLength={120} placeholder={t.quote.fullNamePlaceholder} /></label>
      <label><span>{t.quote.email}</span><Input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
      <label><span>{t.quote.phone}</span><Input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40} placeholder="+44" /></label>
      <label><span>{t.quote.city}</span><span className="select-wrap"><select name="pickupCity" required defaultValue=""><option value="" disabled>{t.quote.selectCity}</option>{cityValues.map((city) => <option key={city} value={city}>{t.cityNames[city]}</option>)}</select><ChevronDown /></span></label>
      <label><span>{t.quote.service}</span><span className="select-wrap"><select name="serviceType" required value={serviceType} onChange={(event) => setServiceType(event.target.value)}><option value="" disabled>{t.quote.selectService}</option>{serviceValues.map((service) => <option key={service} value={service}>{t.quote.services[service]}</option>)}</select><ChevronDown /></span></label>
      <label className="span-two"><span>{t.quote.vehicle}</span><span className="select-wrap"><select name="vehicleClass" required value={selectedVehicle} onChange={(event) => changeVehicle(event.target.value as VehicleClass)}>{vehicleValues.map((vehicle) => <option key={vehicle} value={vehicle}>{t.quote.vehicles[vehicle]}</option>)}</select><ChevronDown /></span></label>
      <label className="span-two"><span>{t.quote.pickup}</span><Input name="pickupLocation" required minLength={2} maxLength={300} placeholder={t.quote.pickupPlaceholder} /></label>
      {serviceType === "Hourly hire" ? <label className="span-two"><span>{t.quote.hours}</span><span className="select-wrap"><select name="hireHours" required defaultValue="2">{Array.from({ length: 15 }, (_, index) => index + 2).map((hours) => <option key={hours} value={hours}>{hours} {t.quote.hoursUnit}</option>)}</select><ChevronDown /></span><small className="hourly-note">{t.quote.hourlyNote}</small></label> : <label className="span-two"><span>{t.quote.destination}</span><Input name="destination" required minLength={2} maxLength={300} placeholder={t.quote.destinationPlaceholder} /></label>}
      <label><span>{t.quote.date}</span><Input name="journeyDate" type="date" required min={new Date().toISOString().split("T")[0]} /></label>
      <label><span>{t.quote.time}</span><Input name="journeyTime" type="time" required /></label>
      <NumberStepper label={t.quote.passengers} name="passengers" value={passengers} min={1} max={passengerLimit} onChange={(value) => setPassengers(Math.min(value, passengerLimit))} />
      <NumberStepper label={t.quote.luggage} name="luggage" value={luggage} min={0} max={luggageLimit} onChange={(value) => setLuggage(Math.min(value, luggageLimit))} />
      <label className="span-two"><span>{t.quote.notes}</span><Textarea name="notes" maxLength={1500} rows={4} placeholder={t.quote.notesPlaceholder} /></label>
    </div>
    <div className="quote-actions"><p>{t.quote.privacy}</p><Button type="submit" className="quote-submit" disabled={state === "sending"}>{state === "sending" ? <><LoaderCircle className="animate-spin" /> {t.quote.sending}</> : <>{t.quote.submit} <ArrowRight /></>}</Button></div>
    {state === "error" && <p className="form-error" role="alert">{t.quote.error}</p>}
  </form>;
}

function IndexPage() {
  return <LanguageProvider><Index /></LanguageProvider>;
}

function Index() {
  const { t } = useLanguage();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleClass>("Please advise");
  function quoteVehicle(vehicle: VehicleClass) {
    setSelectedVehicle(vehicle);
    window.requestAnimationFrame(() => document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" }));
  }
  function moveStage(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width - .5) * 2}`);
    event.currentTarget.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height - .5) * 2}`);
  }
  const navItems = [[t.nav.services, "#services"], [t.nav.fleet, "#fleet"], [t.nav.cities, "#cities"], [t.nav.process, "#process"]];
  return <main className="min-h-screen overflow-hidden bg-background text-foreground">
    <header className="absolute inset-x-0 top-0 z-50 border-b border-border/60 bg-background/45 backdrop-blur-md"><div className="site-shell flex h-20 items-center justify-between gap-3"><a href="#top" className="flex min-w-0 items-center gap-3" aria-label={t.nav.home}><BrandMark /><span className="header-brand-name font-mono uppercase text-foreground">Driveo Exclusive Limited</span></a><nav aria-label={t.nav.main} className="hidden items-center gap-8 lg:flex">{navItems.map(([label, href]) => <a key={href} href={href} className="nav-link">{label}</a>)}</nav><div className="flex items-center gap-2"><LanguageSwitcher /><QuoteLink>{t.nav.quote} <span aria-hidden="true">↘</span></QuoteLink></div></div></header>
    <section id="top" className="hero-stage relative min-h-[92svh] overflow-hidden" onMouseMove={moveStage}>
      <div className="hero-camera"><div className="hero-plane hero-plane-back" aria-hidden="true" /><HeroJourney label={t.hero.videoAlt} /><div className="hero-plane hero-plane-glass" aria-hidden="true" /><div className="hero-light-line" aria-hidden="true" /></div>
      <div className="hero-shade absolute inset-0" /><div className="site-shell relative z-10 flex min-h-[92svh] items-center pb-16 pt-32"><div className="max-w-4xl"><BrandMark className="hero-brand" /><p className="eyebrow animate-rise"><span />{t.hero.eyebrow}</p><h1 className="hero-title animate-rise-delay">{t.hero.titleLine1}<br />{t.hero.titleLine2} <em>{t.hero.titleEm}</em></h1><p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{t.hero.sub}</p><div className="mt-9 flex flex-wrap gap-3"><QuoteLink className="button-primary button-large">{t.hero.cta} <span aria-hidden="true">↘</span></QuoteLink><a href={whatsappUrl} className="button-secondary social-icon hero-whatsapp" target="_blank" rel="noreferrer" aria-label={t.hero.whatsapp} title="WhatsApp"><FaWhatsapp aria-hidden="true" /></a></div><div className="hero-cities mt-14 font-mono uppercase text-foreground">{cityValues.map((city) => <span key={city}>{t.cityNames[city]}</span>)}</div></div></div><div className="depth-rail" aria-hidden="true">{t.hero.rail.map((word) => <span key={word}>{word}</span>)}</div>
    </section>
    <section id="assurance" className="bg-secondary"><div className="site-shell grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">{t.assurance.map((item, index) => <article key={item.title} className="border-l border-primary/40 pl-5"><p className="section-index">0{index + 1}</p><h2 className="mt-3 font-display text-2xl">{item.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p></article>)}</div></section>
    <section id="services" className="section-band bg-background"><div className="site-shell"><div className="section-heading"><div><p className="eyebrow"><span />{t.services.eyebrow}</p><h2>{t.services.title}</h2></div><p>{t.services.intro}</p></div><div className="services-grid">{t.services.items.map((item, index) => <article key={item.title} className="service-cell"><p className="section-index">0{index + 1} · {item.label}</p><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></div></section>
    <section id="fleet" className="section-band bg-secondary"><div className="site-shell"><p className="eyebrow"><span />{t.fleet.eyebrow}</p><h2 className="section-title">{t.fleet.title}</h2><div className="fleet-grid">{t.fleet.items.map((item, index) => <article key={item.title} className={`fleet-card fleet-card-${index + 1}`} onMouseMove={moveStage}><div className="fleet-image-wrap"><img src={fleetMedia[index]![0]} alt={`${fleetMedia[index]![1]} black exterior`} width={1536} height={1152} loading="lazy" /><div className="fleet-reflection" /></div><div className="mt-5"><h3>{item.title}</h3></div><p>{item.copy}</p><Button type="button" className="fleet-quote-button" onClick={() => quoteVehicle(vehicleValues[index]!)}>{t.fleet.button} <ArrowRight /></Button></article>)}</div></div></section>
    <section id="cities" className="section-band bg-background"><div className="site-shell cities-layout"><div><p className="eyebrow"><span />{t.cities.eyebrow}</p><h2 className="section-title">{t.cities.titleLine1}<br />{t.cities.titleLine2}</h2><p className="mt-6 max-w-md leading-7 text-muted-foreground">{t.cities.copy}</p></div><div className="city-grid">{cityValues.map((city, i) => <article key={city}><span>0{i + 1}</span><h3>{t.cityNames[city]}</h3><p>Driveo</p></article>)}</div></div></section>
    <section id="process" className="section-band bg-secondary"><div className="site-shell"><p className="eyebrow"><span />{t.process.eyebrow}</p><h2 className="section-title">{t.process.title}</h2><div className="process-grid">{t.process.items.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></div></section>
    <section id="quote" className="quote-band"><div className="quote-orbit" aria-hidden="true"><i /><i /><i /></div><div className="site-shell quote-layout"><div className="quote-intro"><p className="eyebrow"><span />{t.quote.eyebrow}</p><h2>{t.quote.title}</h2><p>{t.quote.intro}</p><div className="quote-seal"><BrandMark /><span>{t.quote.seal.split("\n").map((line) => <span key={line} className="block">{line}</span>)}</span></div></div><QuoteForm selectedVehicle={selectedVehicle} onVehicleChange={setSelectedVehicle} /></div></section>
    <section className="testimonial-band bg-background"><div className="site-shell"><p className="eyebrow"><span />{t.testimonial.eyebrow}</p><blockquote>{t.testimonial.quote}</blockquote><p className="testimonial-note">{t.testimonial.note}</p></div></section>
    <footer id="contact" className="border-t border-border bg-secondary"><div className="site-shell py-16"><div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]"><div><div className="flex items-center gap-3"><BrandMark className="footer-brand" /><span className="font-mono text-xs uppercase tracking-[0.28em]">Driveo Exclusive Limited</span></div><p className="mt-6 max-w-sm font-display text-3xl">{t.footer.tagline}</p><QuoteLink className="button-primary mt-7">{t.footer.cta} <span aria-hidden="true">↗</span></QuoteLink></div><div><p className="footer-label">{t.footer.contact}</p><a href="tel:+443300430976" className="footer-link">📞 +44 330 043 0976</a><br /><a href="mailto:driveolimited@gmail.com" className="footer-link footer-email">📧 driveolimited@gmail.com</a><p className="mt-3 text-sm text-muted-foreground">{t.footer.contactNote}</p><div className="social-links" aria-label={t.footer.social}><a href={whatsappUrl} target="_blank" rel="noreferrer" className="social-icon" aria-label="WhatsApp" title="WhatsApp"><FaWhatsapp aria-hidden="true" /></a>{socialLinks.map(([label, href, Icon]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="social-icon" aria-label={label} title={label}><Icon aria-hidden="true" /></a>)}</div><div className="mt-5"><p className="footer-label">{t.install.label}</p><InstallButton /></div></div><div><p className="footer-label">{t.footer.cities}</p><p className="text-sm leading-7 text-muted-foreground">{cityValues.map((city) => <span key={city} className="block">{t.cityNames[city]}</span>)}</p></div></div><div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:justify-between"><span>{t.footer.copyright}</span><span>{t.footer.motto}</span></div></div></footer>
  </main>;
}
