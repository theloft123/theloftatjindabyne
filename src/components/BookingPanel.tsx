"use client";

import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isWeekend,
  getDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useMemo, useState, useEffect } from "react";
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
  day_disabled: "cursor-not-allowed bg-red-200 text-red-700 line-through decoration-2 decoration-red-600 font-bold hover:bg-red-300 [&:not(.rdp-day_outside)]:opacity-100",
} as const;

type StayBreakdown = {
  nights: number;
  weekendNights: number;
  weekdayNights: number;
  nightlyTotal: number;
  cleaningFee: number;
  occupancyFee: number;
  total: number;
};

type BookingPanelProps = {
  bookings: SiteContent["bookings"];
  reservations: SiteContent["reservations"];
};

export function BookingPanel({ bookings, reservations }: BookingPanelProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const { role } = useAccess();
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    phone: "",
    adults: 2,
    childrenUnder12: 0,
  });
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [blockedDateMessage, setBlockedDateMessage] = useState<string | null>(null);
  // Store input values as strings to allow proper editing/backspace
  const [adultsInput, setAdultsInput] = useState("2");
  const [childrenInput, setChildrenInput] = useState("0");

  // Fallback for panelText if not yet in database
  const panelText = bookings.panelText || {
    eyebrow: "Availability & Pricing",
    heading: "Plan your stay",
    description: "Select your arrival and departure dates to view the current rate. Weekends attract a premium, while longer mid-week stays are rewarded with our best nightly pricing.",
    detail1: "Self check-in from 3:00pm, check-out by 10:00am",
    detail2: "Rates include all linen, cleaning fee, and local taxes",
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if selected range overlaps with booked dates
  const hasConflict = useMemo(() => {
    if (!range?.from || !range?.to) return false;
    
    const selectedDates = eachDayOfInterval({
      start: range.from,
      end: addDays(range.to, -1),
    });

    return selectedDates.some(date => {
      return reservations.some((res) => {
        if (res.status !== "confirmed" && res.status !== "pending") return false;
        const checkIn = new Date(res.check_in_date);
        const checkOut = new Date(res.check_out_date);
        return date >= checkIn && date < checkOut;
      });
    });
  }, [range, reservations]);

  const breakdown = useMemo(() => {
    if (!range?.from || !range?.to) {
      return null;
    }

    const nights = Math.max(0, differenceInNights(range.from, range.to));

    if (nights < bookings.minimumNights) {
      return null;
    }

    if (bookings.maximumNights && nights > bookings.maximumNights) {
      return null;
    }

    const stayNights = eachDayOfInterval({
      start: range.from,
      end: addDays(range.to, -1),
    });

    // Calculate nightly total with dynamic pricing
    let nightlyTotal = 0;
    let weekendNights = 0;
    let weekdayNights = 0;

    for (const date of stayNights) {
      const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek] as keyof typeof bookings.dayOfWeekRates;

      // Check for custom rate periods
      let rateForNight: number | null = null;
      
      if (bookings.customRates && bookings.customRates.length > 0) {
        for (const customRate of bookings.customRates) {
          const start = parseISO(customRate.startDate);
          const end = parseISO(customRate.endDate);
          if (isWithinInterval(date, { start, end })) {
            rateForNight = customRate.rate;
            break;
          }
        }
      }

      // Check for day-of-week rate
      if (rateForNight === null && bookings.dayOfWeekRates && bookings.dayOfWeekRates[dayName]) {
        rateForNight = bookings.dayOfWeekRates[dayName]!;
      }

      // Fall back to weekend/weekday rates
      if (rateForNight === null) {
        if (isWeekend(date)) {
          rateForNight = bookings.weekendRate;
          weekendNights++;
        } else {
          rateForNight = bookings.weekdayRate;
          weekdayNights++;
        }
      } else {
        // Count as weekend or weekday for display purposes
        if (isWeekend(date)) {
          weekendNights++;
        } else {
          weekdayNights++;
        }
      }

      nightlyTotal += rateForNight;
    }

    // Calculate occupancy fees if enabled
    let occupancyFee = 0;
    if (bookings.occupancyPricing?.enabled) {
      const totalGuests = guestDetails.adults + guestDetails.childrenUnder12;
      const extraAdults = Math.max(0, guestDetails.adults - bookings.occupancyPricing.baseOccupancy);
      
      if (extraAdults > 0) {
        // Charge per extra adult (12+), per night
        occupancyFee = extraAdults * bookings.occupancyPricing.perAdultRate * nights;
      }
    }

    const total = nightlyTotal + bookings.cleaningFee + occupancyFee;

    return {
      nights,
      weekendNights,
      weekdayNights,
      nightlyTotal,
      cleaningFee: bookings.cleaningFee,
      occupancyFee,
      total,
    } satisfies StayBreakdown;
  }, [bookings, range, guestDetails.adults, guestDetails.childrenUnder12]);

  const disabledDays = useMemo(() => {
    // Manual blocked dates
    const blocked = bookings.blockedDates.map(({ start, end }) => ({
      from: new Date(start),
      to: new Date(end),
    }));

    // Blocked dates from confirmed reservations
    const reservationBlocked = reservations
      .filter((res) => res.status === "confirmed" || res.status === "pending")
      .map((res) => ({
        from: new Date(res.check_in_date),
        to: addDays(new Date(res.check_out_date), -1),
      }));

    // Calculate max advance booking cutoff date
    const maxAdvanceMonths = bookings.maxAdvanceBookingMonths;
    const today = startOfToday();
    const maxBookingDate = maxAdvanceMonths 
      ? addMonths(today, maxAdvanceMonths)
      : null;

    // Build the disabled list - past dates and blocked ranges
    const disabledList = [
      { before: today },
      ...blocked,
      ...reservationBlocked,
      // Add max advance booking restriction if set
      ...(maxBookingDate ? [{ after: maxBookingDate }] : []),
    ];

    return disabledList;
  }, [bookings.blockedDates, bookings.maxAdvanceBookingMonths, reservations]);

  return (
    <section
      id="availability"
      className="scroll-mt-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="md:max-w-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            {panelText.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {panelText.heading}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {panelText.description}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Minimum stay of {bookings.minimumNights} nights</li>
            {panelText.detail1 && <li>• {panelText.detail1}</li>}
            {panelText.detail2 && <li>• {panelText.detail2}</li>}
          </ul>
        </div>
        <div className="flex-1 space-y-6">
          {hasConflict && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-bold">⚠️ Dates Not Available</p>
              <p className="mt-1">Your selection includes dates that are already booked. Please choose different dates.</p>
            </div>
          )}
          <div className="rounded-3xl border border-slate-200 p-4 md:p-6 shadow-inner bg-white overflow-x-auto">
            {blockedDateMessage && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">⚠️ {blockedDateMessage}</p>
                <button
                  onClick={() => setBlockedDateMessage(null)}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            <DayPicker
              mode="range"
              numberOfMonths={isMobile ? 1 : 2}
              selected={range}
              onSelect={(newRange) => {
                setRange(newRange);
                // Clear message when user selects new dates
                if (blockedDateMessage) {
                  setBlockedDateMessage(null);
                }
              }}
              disabled={disabledDays}
              weekStartsOn={1}
              classNames={CALENDAR_CLASS_NAMES}
                onDayClick={(day, modifiers) => {
                if (modifiers.disabled) {
                  // Check if it's a past date
                  const today = startOfToday();
                  if (day < today) {
                    alert("⚠️ Cannot book past dates.\n\nPlease select a date from today onwards.");
                    return;
                  }

                  // Check if it's beyond the max advance booking limit
                  const maxAdvanceMonths = bookings.maxAdvanceBookingMonths;
                  if (maxAdvanceMonths) {
                    const maxBookingDate = addMonths(today, maxAdvanceMonths);
                    if (day > maxBookingDate) {
                      const limitDate = format(maxBookingDate, "MMMM d, yyyy");
                      alert(`⚠️ Cannot book this far in advance.\n\nBookings are currently limited to ${maxAdvanceMonths} months ahead.\n\nThe latest available date is ${limitDate}.`);
                      setBlockedDateMessage(`Bookings are limited to ${maxAdvanceMonths} months in advance.`);
                      return;
                    }
                  }

                  // Check if it's a reservation
                  const conflictingReservation = reservations.find((res) => {
                    if (res.status !== "confirmed" && res.status !== "pending") return false;
                    const checkIn = new Date(res.check_in_date);
                    const checkOut = new Date(res.check_out_date);
                    return day >= checkIn && day < checkOut;
                  });
                  
                  if (conflictingReservation) {
                    const checkIn = format(new Date(conflictingReservation.check_in_date), "MMM d, yyyy");
                    const checkOut = format(new Date(conflictingReservation.check_out_date), "MMM d, yyyy");
                    alert(`⚠️ This date is already booked!\n\nAnother guest has a reservation from ${checkIn} to ${checkOut}.\n\nPlease choose different dates.`);
                    setBlockedDateMessage("This date is unavailable - already booked by another guest.");
                  } else {
                    // Check if it's an admin-blocked date
                    const isAdminBlocked = bookings.blockedDates.some((blocked) => {
                      const start = new Date(blocked.start);
                      const end = new Date(blocked.end);
                      return day >= start && day <= end;
                    });

                    if (isAdminBlocked) {
                      alert("⚠️ This date is not available for booking.\n\nThe property owner has blocked this period.\n\nPlease choose different dates.");
                    } else {
                      alert("⚠️ This date is not available for booking.\n\nPlease choose different dates.");
                    }
                    setBlockedDateMessage("This date is not available for booking.");
                  }
                }
              }}
            />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-800">
            {breakdown && !hasConflict ? (
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
                  {breakdown.occupancyFee > 0 && (
                    <div className="flex items-center justify-between">
                      <dt>
                        Additional adults{" "}
                        <span className="text-slate-500">
                          ({Math.max(0, guestDetails.adults - (bookings.occupancyPricing?.baseOccupancy ?? 0))} extra adults)
                        </span>
                      </dt>
                      <dd>${breakdown.occupancyFee}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-6 flex items-center justify-between text-base font-semibold">
                  <p>Total due</p>
                  <p>${breakdown.total}</p>
                </div>
                
                {!showGuestForm ? (
                  <button
                    type="button"
                    className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                    onClick={() => setShowGuestForm(true)}
                  >
                    Continue to Guest Details
                  </button>
                ) : (
                  <div className="mt-6 space-y-4">
                    {bookings.occupancyPricing?.enabled && (
                      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                          Guest Count (Required)
                        </p>
                        <p className="mt-2 text-xs text-sky-600">
                          {bookings.occupancyPricing.description}
                        </p>
                        <p className="mt-1 text-xs text-sky-600">
                          Maximum occupancy: {bookings.occupancyPricing.maxOccupancy} guests
                        </p>
                        <div className="mt-3 grid gap-3 grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                              Adults (12+)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={bookings.occupancyPricing.maxOccupancy}
                              required
                              value={adultsInput}
                              onChange={(e) => {
                                const value = e.target.value;
                                setAdultsInput(value); // Always update display value
                                
                                // Parse and validate for calculations
                                const adults = parseInt(value, 10);
                                if (!isNaN(adults) && adults >= 1) {
                                  const clampedAdults = Math.min(adults, bookings.occupancyPricing!.maxOccupancy);
                                  setGuestDetails({...guestDetails, adults: clampedAdults});
                                }
                              }}
                              onBlur={(e) => {
                                // On blur, ensure we have a valid value
                                const adults = parseInt(e.target.value, 10);
                                if (isNaN(adults) || adults < 1) {
                                  setAdultsInput("1");
                                  setGuestDetails({...guestDetails, adults: 1});
                                } else {
                                  setAdultsInput(guestDetails.adults.toString());
                                }
                              }}
                              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                              Children (under 12)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={bookings.occupancyPricing.maxOccupancy - 1}
                              required
                              value={childrenInput}
                              onChange={(e) => {
                                const value = e.target.value;
                                setChildrenInput(value); // Always update display value
                                
                                // Parse and validate for calculations
                                const children = parseInt(value, 10);
                                if (!isNaN(children) && children >= 0) {
                                  const maxChildren = bookings.occupancyPricing!.maxOccupancy - 1;
                                  const clampedChildren = Math.min(children, maxChildren);
                                  setGuestDetails({...guestDetails, childrenUnder12: clampedChildren});
                                }
                              }}
                              onBlur={(e) => {
                                // On blur, ensure we have a valid value
                                const children = parseInt(e.target.value, 10);
                                if (isNaN(children) || children < 0) {
                                  setChildrenInput("0");
                                  setGuestDetails({...guestDetails, childrenUnder12: 0});
                                } else {
                                  setChildrenInput(guestDetails.childrenUnder12.toString());
                                }
                              }}
                              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                            />
                          </div>
                        </div>
                        {(guestDetails.adults + guestDetails.childrenUnder12) > bookings.occupancyPricing.maxOccupancy && (
                          <p className="mt-2 text-xs text-red-600">
                            Total guests cannot exceed {bookings.occupancyPricing.maxOccupancy}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={guestDetails.name}
                          onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                          placeholder="John Smith"
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={guestDetails.email}
                          onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                          placeholder="john@example.com"
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={guestDetails.phone}
                          onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                          placeholder="+61 400 000 000"
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="flex-1 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400"
                        onClick={() => setShowGuestForm(false)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={
                          !guestDetails.name ||
                          !guestDetails.email ||
                          !guestDetails.phone ||
                          isProcessingCheckout ||
                          (bookings.occupancyPricing?.enabled &&
                            guestDetails.adults + guestDetails.childrenUnder12 >
                              bookings.occupancyPricing.maxOccupancy)
                        }
                        className="flex-1 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={async () => {
                          if (!range?.from || !range?.to || !breakdown) return;

                          setIsProcessingCheckout(true);
                          try {
                            const response = await fetch("/api/stripe/checkout", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                checkInDate: format(range.from, "yyyy-MM-dd"),
                                checkOutDate: format(range.to, "yyyy-MM-dd"),
                                guestName: guestDetails.name,
                                guestEmail: guestDetails.email,
                                guestPhone: guestDetails.phone,
                                adults: guestDetails.adults,
                                childrenUnder12: guestDetails.childrenUnder12,
                                totalAmount: breakdown.total,
                                weekdayNights: breakdown.weekdayNights,
                                weekendNights: breakdown.weekendNights,
                                cleaningFee: breakdown.cleaningFee,
                                occupancyFee: breakdown.occupancyFee,
                              }),
                            });

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(data.error || "Failed to create checkout session");
                            }

                            // Redirect to Stripe Checkout
                            if (data.url) {
                              window.location.href = data.url;
                            }
                          } catch (error: any) {
                            console.error("Checkout error:", error);
                            alert(
                              error.message ||
                                "Failed to proceed to checkout. Please try again."
                            );
                            setIsProcessingCheckout(false);
                          }
                        }}
                      >
                        {isProcessingCheckout ? "Processing..." : "Proceed to Checkout"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : hasConflict ? (
              <div className="space-y-4 text-center text-slate-600">
                <h3 className="text-base font-semibold text-red-700">
                  ⚠️ Selected dates are unavailable
                </h3>
                <p className="text-sm leading-6">
                  Your selection includes dates that are already booked by another guest.
                  Please adjust your dates to see pricing and continue with your booking.
                </p>
                <button
                  type="button"
                  className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-700 hover:bg-red-100"
                  onClick={() => setRange(undefined)}
                >
                  Clear Selection
                </button>
              </div>
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
        {bookings.maximumNights 
          ? ` nights, with a maximum of ${bookings.maximumNights} nights.`
          : " nights."}
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

