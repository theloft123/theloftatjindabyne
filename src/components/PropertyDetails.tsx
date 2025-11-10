import type { SiteContent } from "@/lib/siteContent";

type PropertyDetailsProps = {
  details: SiteContent["details"];
};

export function PropertyDetails({ details }: PropertyDetailsProps) {
  return (
    <section
      id="details"
      className="scroll-mt-20 rounded-3xl bg-slate-900 text-slate-100"
    >
      <div className="grid gap-8 p-10 md:grid-cols-[1.2fr_1fr] md:gap-16 md:p-14">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Property Details
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {details.introHeading}
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            {details.introCopy}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
          <h3 className="text-base font-semibold text-white">Highlights</h3>
          <dl className="mt-4 space-y-4">
            {details.highlights.map((item) => (
              <div key={item.title}>
                <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {item.title}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {item.highlight}
                </dd>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              </div>
            ))}
          </dl>
        </div>
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-base font-semibold text-white">Amenities</h3>
            <ul className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              {details.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>{amenity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

