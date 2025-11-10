"use client";

import { AdminPanel } from "@/components/AdminPanel";
import { BookingPanel } from "@/components/BookingPanel";
import { Hero } from "@/components/Hero";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PropertyDetails } from "@/components/PropertyDetails";
import { useAccess } from "@/context/AccessContext";
import { useSiteContent } from "@/context/SiteContentContext";

export function LandingShell() {
  const { content, loading, error } = useSiteContent();
  const { role, clearAccess } = useAccess();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Loading property details...
        </p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-red-500">
          <p className="font-semibold">We can’t load the property data right now.</p>
          <p className="text-sm">
            {error ?? "Check your Supabase configuration and try refreshing the page."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16 md:px-10 md:py-20 lg:gap-20">
        <header className="flex items-center justify-between rounded-full border border-slate-200 bg-white/70 px-6 py-4 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Jindabyne, NSW
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              The Loft at Jindabyne
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 md:flex">
              <a href="#details" className="hover:text-slate-900">
                Details
              </a>
              <a href="#photos" className="hover:text-slate-900">
                Photos
              </a>
              <a href="#availability" className="hover:text-slate-900">
                Availability
              </a>
            </nav>
            <button
              onClick={clearAccess}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>
        {role === "admin" && (
          <div className="rounded-3xl border border-sky-200 bg-sky-50 px-6 py-4 text-sky-700">
            <p className="text-sm font-semibold">Admin mode enabled.</p>
            <p className="text-xs">
              Any changes you make below are saved to Supabase and become visible to guests immediately.
            </p>
          </div>
        )}
        <main className="flex flex-col gap-16 lg:gap-20">
          <Hero hero={content.hero} details={content.details} />
          <PhotoGallery photos={content.gallery} />
          <PropertyDetails details={content.details} />
          <BookingPanel bookings={content.bookings} />
        </main>
        <footer className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-500 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} The Loft at Jindabyne. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:stay@theloftjindabyne.com"
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                stay@theloftjindabyne.com
              </a>
              <span>ABN 00 000 000 000</span>
            </div>
          </div>
        </footer>
        {role === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}
