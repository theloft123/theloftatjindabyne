"use client";

import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isWeekend,
} from "date-fns";
import { useMemo, useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import { useAccess } from "@/context/AccessContext";
import type { SiteContent } from "@/lib/siteContent";

const CALENDAR_CLASS_NAMES = {
  months: "",
  month: "",
  caption: "flex justify-between items-center px-2 py-2 text-sm font-medium text-slate-700",
  caption_label: "font-semibold uppercase tracking-[0.3em] text-sm",
  nav: "flex gap-1",
  nav_button: "h-7 w-7 rounded-md border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center",
  nav_button_previous: "",
  nav_button_next: "",
  table: "",
  head_row: "",
  head_cell: "text-xs font-semibold uppercase tracking-[0.3em] text-slate-500",
  row: "",
  cell: "",
  day: "rounded-full text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer",
  day_today: "border-2 border-slate-400 bg-white text-slate-900 font-semibold",
  day_outside: "text-slate-300 opacity-50",
  day_selected: "bg-slate-900 text-white shadow-lg hover:bg-slate-800",
  day_range_start:
    "bg-sky-500 text-slate-950 hover:bg-sky-400",
  day_range_end: "bg-sky-500 text-slate-950 hover:bg-sky-400",
  day_range_middle: "bg-sky-100 text-slate-900 hover:bg-sky-200",
  day_disabled: "cursor-not-allowed text-slate-300 line-through opacity-40 hover:bg-transparent",
} as const;

type StayBreakdown = {
  nights: number;
  weekendNights: number;
  weekdayNights: number;
  nightlyTotal: number;
  cleaningFee: number;
  total: number;
};

type BookingPanelProps = {
  bookings: SiteContent["bookings"];
};

export function BookingPanel({ bookings }: BookingPanelProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const { role } = useAccess();

  const breakdown = useMemo(() => {
    if (!range?.from || !range?.to) {
      return null;
    }

    const nights = Math.max(0, differenceInNights(range.from, range.to));

    if (nights < bookings.minimumNights) {
      return null;
    }

    const stayNights = eachDayOfInterval({
      start: range.from,
      end: addDays(range.to, -1),
    });

    const weekendNights = stayNights.filter((date) => isWeekend(date)).length;
    const weekdayNights = nights - weekendNights;

    const nightlyTotal =
      weekdayNights * bookings.weekdayRate +
      weekendNights * bookings.weekendRate;

    const total = nightlyTotal + bookings.cleaningFee;

    return {
      nights,
      weekendNights,
      weekdayNights,
      nightlyTotal,
      cleaningFee: bookings.cleaningFee,
      total,
    } satisfies StayBreakdown;
  }, [bookings, range]);

  const disabledDays = useMemo(() => {
    const blocked = bookings.blockedDates.flatMap(({ start, end }) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return eachDayOfInterval({ start: startDate, end: endDate });
    });

    return [
      { before: startOfToday() },
      ...blocked.map((date) => ({ date })),
    ];
  }, [bookings.blockedDates]);

  return (
    <section
      id="availability"
      className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="md:max-w-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Availability & Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Plan your stay
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Select your arrival and departure dates to view the current rate.
            Weekends attract a premium, while longer mid-week stays are rewarded
            with our best nightly pricing.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Minimum stay of {bookings.minimumNights} nights</li>
            <li>• Self check-in from 3:00pm, check-out by 10:00am</li>
            <li>• Rates include all linen, cleaning fee, and local taxes</li>
          </ul>
        </div>
        <div className="flex-1 space-y-6">
          <div className="rounded-3xl border border-slate-200 p-6 shadow-inner bg-white">
            <DayPicker
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={setRange}
              disabled={disabledDays}
              weekStartsOn={1}
              classNames={CALENDAR_CLASS_NAMES}
            />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-800">
            {breakdown ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Your stay
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {format(range!.from!, "EEE d MMM")} &ndash;{" "}
                      {format(range!.to!, "EEE d MMM yyyy")}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white">
                    {breakdown.nights} nights
                  </span>
                </div>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt>
                      Weeknight rate{" "}
                      <span className="text-slate-500">
                        ({breakdown.weekdayNights} nights @ ${bookings.weekdayRate})
                      </span>
                    </dt>
                    <dd>${breakdown.weekdayNights * bookings.weekdayRate}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>
                      Weekend rate{" "}
                      <span className="text-slate-500">
                        ({breakdown.weekendNights} nights @ ${bookings.weekendRate})
                      </span>
                    </dt>
                    <dd>${breakdown.weekendNights * bookings.weekendRate}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Cleaning & preparation</dt>
                    <dd>${breakdown.cleaningFee}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex items-center justify-between text-base font-semibold">
                  <p>Total due</p>
                  <p>${breakdown.total}</p>
                </div>
                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                  onClick={() => {
                    alert(
                      "Checkout is coming soon. We’ll connect this button to a secure Stripe payment when ready."
                    );
                  }}
                >
                  Proceed to Checkout
                </button>
              </>
            ) : (
              <EmptyState bookings={bookings} role={role} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function differenceInNights(start: Date, end: Date) {
  return Math.max(0, differenceInCalendarDays(end, start));
}

function EmptyState({
  bookings,
  role,
}: {
  bookings: SiteContent["bookings"];
  role: "guest" | "admin" | null;
}) {
  return (
    <div className="space-y-4 text-center text-slate-600">
      <h3 className="text-base font-semibold text-slate-900">
        Select your dates to reveal pricing
      </h3>
      <p className="text-sm leading-6">
        Choose check-in and check-out dates to calculate the nightly breakdown
        and secure your stay. We require a minimum stay of {bookings.minimumNights}
        nights.
      </p>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        Weeknights from ${bookings.weekdayRate} · Weekends from ${bookings.weekendRate}
      </p>
      <button
        type="button"
        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-400"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Learn more about the loft
      </button>
      {role === "admin" && (
        <p className="text-xs text-slate-500">
          Admin tip: Manage blocked dates, rates, and fees from the admin control panel.
        </p>
      )}
    </div>
  );
}

