"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/stripe/session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setSessionData(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching session:", err);
          setError("Failed to load booking details");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (error || !sessionId) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-lg md:p-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Booking Error
            </h1>
            <p className="mt-4 text-slate-600">
              {error || "Invalid booking session"}
            </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-sky-600 px-8 py-3 text-base font-bold uppercase tracking-wide text-white transition hover:bg-sky-700"
          >
            Return to Home
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-green-200 bg-white p-8 shadow-lg md:p-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Booking Confirmed!
          </h1>
          <p className="mt-4 text-slate-600">
            Thank you for booking The Loft at Jindabyne. You'll receive a
            confirmation email shortly with all the details for your stay.
          </p>
        </div>

        {sessionData?.metadata && (
          <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Booking Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Guest Name</dt>
                <dd className="font-medium text-slate-900">
                  {sessionData.metadata.guestName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Email</dt>
                <dd className="font-medium text-slate-900">
                  {sessionData.metadata.guestEmail}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Check-in</dt>
                <dd className="font-medium text-slate-900">
                  {sessionData.metadata.checkInDate}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Check-out</dt>
                <dd className="font-medium text-slate-900">
                  {sessionData.metadata.checkOutDate}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <dt className="font-semibold text-slate-900">Total Paid</dt>
                <dd className="font-semibold text-slate-900">
                  ${sessionData.metadata.totalAmount}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-900">
              What's Next?
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-blue-800">
              <li>• Check your email for confirmation and booking details</li>
              <li>• Self check-in instructions will be sent 24 hours before arrival</li>
              <li>• Check-in from 3:00pm, check-out by 10:00am</li>
            </ul>
          </div>
          {sessionData?.metadata?.bookingId && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">
                Need to Cancel?
              </p>
              <p className="text-xs text-slate-600 mb-3">
                You can cancel this booking and request a refund using the link below.
              </p>
              <Link
                href={`/booking/cancel/${sessionData.metadata.bookingId}`}
                className="text-xs text-red-600 underline hover:text-red-700"
              >
                Cancel this booking →
              </Link>
            </div>
          )}
          <Link
            href="/"
            className="block w-full rounded-full bg-sky-600 px-8 py-3 text-center text-base font-bold uppercase tracking-wide text-white transition hover:bg-sky-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

