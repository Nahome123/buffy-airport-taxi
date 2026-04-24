import type { Metadata } from "next";

import { BookingForm } from "@/components/booking-form";
import { CityBackground } from "@/components/city-background";
import { SiteNav } from "@/components/site-nav";
import { getAppUrl } from "@/lib/env";
import { formatCurrencyFromCents } from "@/lib/format";

export const metadata: Metadata = {
  title: "Buffy Airport Taxi | Buffalo Airport Transfer Scheduler",
  description:
    "Schedule Buffalo airport taxi rides with live mileage pricing, Niagara Falls transfer support, card or cash checkout, and private dispatch management.",
  keywords: [
    "Buffalo airport taxi service",
    "airport shuttle Buffalo NY",
    "Buffalo to Niagara Falls taxi",
    "BUF airport pickup",
    "Buffalo airport car service",
  ],
  alternates: {
    canonical: "/",
  },
};

const pricingExamples = [
  { label: "Base fee", value: 1000 },
  { label: "10 mile sample", value: 3000 },
  { label: "25 mile sample", value: 6000 },
];

const aboutCards = [
  {
    title: "Local airport focus",
    copy:
      "Buffy Airport Taxi is positioned as a simple local transfer service for airport pickups, drop-offs, and scheduled rides across Buffalo and the surrounding area.",
  },
  {
    title: "Straightforward booking",
    copy:
      "The experience is designed to feel direct and low-friction: riders enter the trip details, review pricing, and continue to secure checkout without extra steps.",
  },
  {
    title: "Dispatch-ready workflow",
    copy:
      "Behind the scenes, the booking flow is built to support private admin access, payment confirmation, and future trip assignment as the service grows.",
  },
];

export default function Home() {
  const appUrl = getAppUrl();
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": `${appUrl}/#business`,
    name: "Buffy Airport Taxi",
    url: appUrl,
    image: `${appUrl}/opengraph-image`,
    areaServed: ["Buffalo, NY", "Niagara Falls, NY"],
    serviceType: "Airport transportation",
    description:
      "Airport-focused taxi booking for Buffalo and Niagara Falls with route-based pricing and flexible payment options.",
    priceRange: "$$",
    availableLanguage: ["English"],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Buffalo airport transfer",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Niagara Falls transfer",
        },
      },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is pricing calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pricing is based on route mileage and currently starts with a $10 base fee plus $2 per mile.",
        },
      },
      {
        "@type": "Question",
        name: "Can riders pay with cash?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Riders can choose secure online card checkout or reserve the trip and pay cash later.",
        },
      },
      {
        "@type": "Question",
        name: "Does the service cover Niagara Falls?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The booking flow is designed for Buffalo airport transportation and Niagara Falls transfer routes.",
        },
      },
    ],
  };

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <CityBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <SiteNav currentPath="/" accentLabel="Buffalo Airport Booking" />

        <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="animate-rise flex h-full flex-col gap-6">
            <div className="buffalo-glow flex h-full flex-col justify-between rounded-[2.35rem] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,27,0.54),rgba(26,48,69,0.34),rgba(135,59,32,0.18))] p-8 backdrop-blur-md sm:p-10">
              <div>
                <span className="inline-flex rounded-full border border-[color:var(--color-gold)]/40 bg-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
                  Buffalo Private Transfer
                </span>
                <p className="hero-overline mt-8 text-[11px] font-semibold uppercase tracking-[0.42em] text-slate-200/76">
                  Direct Booking Experience
                </p>
                <h1 className="hero-headline mt-4 max-w-xl text-white">
                  <span className="block">Buffy</span>
                  <span className="block text-[color:var(--color-gold)]">
                    Airport Taxi
                  </span>
                </h1>
                <p className="mt-6 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">
                  Book airport rides with live route pricing, quick checkout,
                  and a cleaner dispatch workflow built to feel local and
                  premium at the same time.
                </p>
              </div>

              <div className="hero-copy-panel mt-8 rounded-[1.8rem] border border-white/10 bg-black/18 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-gold)]">
                  Service Snapshot
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-100/88">
                  Route-based pricing, airport-focused bookings, and a private
                  admin flow designed for real dispatch use once the service is
                  live.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {pricingExamples.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.6rem] border border-white/10 bg-black/20 px-4 py-4 text-white/92 backdrop-blur-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {item.label === "Base fee"
                      ? "$10 + $2 / mile"
                      : formatCurrencyFromCents(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-rise-delay flex h-full">
            <BookingForm />
          </div>
        </section>

        <section className="animate-rise-delay pb-10">
          <div className="buffalo-card rounded-[2.3rem] border border-white/10 p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--color-gold)]">
                  About Buffy
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  A clean airport-transfer brand with room to grow
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {aboutCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[1.8rem] border border-white/10 bg-black/16 p-5 backdrop-blur-sm"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
                    {card.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-100/88">
                    {card.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
