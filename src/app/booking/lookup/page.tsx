"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BookingLookupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/lookup?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setBookings(data.bookings || []);
        if (data.bookings.length === 0) {
          setError("No bookings found for this email address.");
        }
      }
    } catch (err: any) {
      setError("Failed to lookup bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg md:p-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Look Up Your Booking
            </h1>
            <p className="mt-4 text-slate-600">
              Enter your email address to find your booking and manage it.
            </p>
          </div>

          <form onSubmit={handleLookup} className="mt-8 space-y-4">
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
              disabled={loading}
              className="w-full rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Looking up..." : "Find My Booking"}
            </button>
          </form>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {bookings.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Your Bookings
              </h2>
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-600">
                        ${booking.total_amount} • {booking.status}
                      </p>
                    </div>
                    <Link
                      href={`/booking/cancel/${booking.id}`}
                      className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-700 hover:bg-red-100"
                    >
                      Cancel Booking
                    </Link>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
