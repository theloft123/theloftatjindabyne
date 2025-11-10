import type { SiteContent } from "@/lib/siteContent";

type HeroProps = {
  hero: SiteContent["hero"];
  details: SiteContent["details"];
};

export function Hero({ hero, details }: HeroProps) {
  const sleepsHighlight = details.highlights.find(
    (item) => item.title.toLowerCase() === "sleeps"
  );
  const locationHighlight = details.highlights.find(
    (item) => item.title.toLowerCase() === "location"
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-16 text-slate-100 shadow-xl md:px-14 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
      <div className="relative grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-200">
            {hero.eyebrow}
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            {hero.headline}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-200">
            {hero.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#availability"
              className="inline-flex items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:bg-sky-300"
            >
              Check availability
            </a>
            <a
              href="#photos"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
            >
              Explore gallery
            </a>
          </div>
        </div>
        <div className="relative grid gap-4 text-sm text-slate-200 md:justify-items-end">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.4em] text-sky-200">
              Sleeps
            </span>
            <p className="mt-2 text-2xl font-semibold">
              {sleepsHighlight?.highlight ?? "Up to 8 guests"}
            </p>
            <p className="mt-3 text-slate-200">
              {sleepsHighlight?.description ??
                "Three spacious bedrooms plus a flexible loft retreat, all dressed with premium linen."}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.4em] text-sky-200">
              Distance
            </span>
            <p className="mt-2 text-2xl font-semibold">
              {locationHighlight?.highlight ?? "Heart of Jindabyne"}
            </p>
            <p className="mt-3 text-slate-200">
              {locationHighlight?.description ??
                "Moments from the lakefront, cafés, and the Snowy Mountains Highway for quick resort access."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

