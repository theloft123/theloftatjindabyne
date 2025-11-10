"use client";

import { AdminPanel } from "@/components/AdminPanel";
import { BookingPanel } from "@/components/BookingPanel";
import { Hero } from "@/components/Hero";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PropertyDetails } from "@/components/PropertyDetails";
import { TermsAndRules } from "@/components/TermsAndRules";
import { useAccess } from "@/context/AccessContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { useState } from "react";

export function LandingShell() {
  const { content, loading, error } = useSiteContent();
  const { role, clearAccess } = useAccess();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
                  Jindabyne, NSW
                </p>
                <h1 className="text-sm md:text-base font-semibold text-slate-900">
                  The Loft @ Jindabyne
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#details"
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Details
              </a>
              <a
                href="#photos"
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Photos
              </a>
              <a
                href="#availability"
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
              >
                Book
              </a>
              <button
                onClick={clearAccess}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-4 space-y-2">
              <a
                href="#details"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Details
              </a>
              <a
                href="#photos"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Photos
              </a>
              <a
                href="#availability"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg bg-sky-500 px-4 py-3.5 text-base font-bold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-sky-400"
              >
                Book Now
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  clearAccess();
                }}
                className="w-full text-left rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-8 md:px-10 md:py-20 lg:gap-20">
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
          <TermsAndRules />
          <BookingPanel bookings={content.bookings} />
        </main>
        <footer className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-500 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} The Loft @ Jindabyne. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:jack.francis.aus@gmail.com"
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                jack.francis.aus@gmail.com
              </a>
              <a
                href="tel:+61497162289"
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                +61 497 162 289
              </a>
            </div>
          </div>
        </footer>
        {role === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}
