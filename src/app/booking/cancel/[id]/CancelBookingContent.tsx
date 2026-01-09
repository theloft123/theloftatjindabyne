"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function CancelBookingContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setBookingId(p.id));
  }, [params]);

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setBooking(data.booking);
          }
        })
        .catch((err) => {
          console.error("Error fetching booking:", err);
          setError("Failed to load booking details");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [bookingId]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    fetch(`/api/bookings/${bookingId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.verified) {
          setEmailSubmitted(true);
          setBooking(data.booking);
        } else {
          setError("Email address does not match this booking.");
        }
      })
      .catch((err) => {
        setError("Failed to verify email. Please try again.");
      });
  };

  const handleCancel = async (withRefund: boolean) => {
    if (!bookingId) return;

    const confirmMessage = withRefund
      ? `Cancel this booking and process a full refund of $${booking.total_amount}?\n\nThis cannot be undone.`
      : `Cancel this booking without refund?\n\nThis cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    setCancelling(true);
    try {
      const response = await fetch(
        `/api/bookings/${bookingId}?refund=${withRefund}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      if (data.refunded) {
        alert(
          `Booking cancelled successfully! $${booking.total_amount} will be refunded to your card within 5-10 business days.`
        );
      } else {
        alert("Booking cancelled successfully!");
      }

      router.push("/?cancelled=true");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (error && !emailSubmitted) {
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
              {error}
            </h1>
            <Link
              href="/"
              className="mt-8 inline-block rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!emailSubmitted && booking) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg md:p-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Cancel Booking
            </h1>
            <p className="mt-4 text-slate-600">
              Please enter the email address used for this booking to verify
              your identity.
            </p>
            <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
              >
                Verify & Continue
              </button>
            </form>
            <Link
              href="/"
              className="mt-4 inline-block text-sm text-slate-600 underline hover:text-slate-900"
            >
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const checkIn = new Date(booking.check_in_date);
  const canCancel = checkIn > new Date(); // Can cancel if check-in hasn't passed

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg md:p-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Cancel Booking
          </h1>
          <p className="mt-4 text-slate-600">
            Review your booking details below before cancelling.
          </p>
        </div>

        <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Booking Details
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Guest Name</dt>
              <dd className="font-medium text-slate-900">{booking.guest_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Check-in</dt>
              <dd className="font-medium text-slate-900">
                {format(new Date(booking.check_in_date), "MMM d, yyyy")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Check-out</dt>
              <dd className="font-medium text-slate-900">
                {format(new Date(booking.check_out_date), "MMM d, yyyy")}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <dt className="font-semibold text-slate-900">Total Paid</dt>
              <dd className="font-semibold text-slate-900">
                ${booking.total_amount}
              </dd>
            </div>
          </dl>
        </div>

        {!canCancel ? (
          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            <p className="font-semibold">⚠️ Check-in has passed</p>
            <p className="mt-1 text-sm">
              This booking cannot be cancelled as the check-in date has already
              passed. Please contact the property owner directly.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {booking.stripe_payment_intent_id ? (
              <button
                onClick={() => handleCancel(true)}
                disabled={cancelling}
                className="w-full rounded-full bg-red-600 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? "Processing..." : "Cancel & Request Refund"}
              </button>
            ) : null}
            <button
              onClick={() => handleCancel(false)}
              disabled={cancelling}
              className="w-full rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {cancelling ? "Processing..." : "Cancel Without Refund"}
            </button>
            <p className="text-center text-xs text-slate-500">
              Refunds typically take 5-10 business days to appear in your
              account.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-slate-600 underline hover:text-slate-900"
        >
          Return to home
        </Link>
      </div>
    </div>
  );
}
