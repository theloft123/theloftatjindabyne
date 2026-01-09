"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Reservation } from "@/lib/bookings";

export function AdminBookingsManager() {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBookings(data.bookings);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id: string, refund: boolean) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    const confirmMessage = refund
      ? `Delete booking for ${booking.guest_name} and process a full refund ($${booking.total_amount})?\n\nThis cannot be undone.`
      : `Delete booking for ${booking.guest_name}?\n\nNo refund will be processed.\n\nThis cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}?refund=${refund}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete booking");
      }

      if (data.refunded) {
        alert(`Booking deleted and $${booking.total_amount} refunded successfully!`);
      } else {
        alert("Booking deleted successfully!");
      }

      // Refresh bookings list
      await fetchBookings();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-center text-slate-600">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-8 py-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Booking Management
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          View and manage all property bookings
        </p>
      </div>

      <div className="p-6">
        {bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-600">
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="mt-1 text-sm">
              Bookings will appear here once guests make reservations
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="pb-3">Guest</th>
                  <th className="pb-3">Check-in</th>
                  <th className="pb-3">Check-out</th>
                  <th className="pb-3">Nights</th>
                  <th className="pb-3">Guests</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="text-sm">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {booking.guest_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {booking.guest_email}
                        </p>
                        {booking.guest_phone && (
                          <p className="text-xs text-slate-500">
                            {booking.guest_phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-slate-700">
                      {format(new Date(booking.check_in_date), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 text-slate-700">
                      {format(new Date(booking.check_out_date), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 text-slate-700">
                      {booking.weekday_nights + booking.weekend_nights}
                    </td>
                    <td className="py-4 text-slate-700">
                      {(() => {
                        // Use structured data if available (new bookings)
                        if (booking.adults !== undefined) {
                          const totalGuests = booking.adults + (booking.children_under_12 || 0);
                          return (
                            <>
                              {totalGuests}
                              {booking.children_under_12 ? (
                                <span className="ml-1 text-xs text-slate-500">
                                  ({booking.adults}A, {booking.children_under_12}C)
                                </span>
                              ) : null}
                            </>
                          );
                        }
                        
                        // Fallback: Parse from notes for old bookings
                        if (booking.notes) {
                          const adultsMatch = booking.notes.match(/Adults: (\d+)/);
                          const childrenMatch = booking.notes.match(/Children \(under 12\): (\d+)/);
                          
                          if (adultsMatch) {
                            const adults = parseInt(adultsMatch[1], 10);
                            const children = childrenMatch ? parseInt(childrenMatch[1], 10) : 0;
                            const totalGuests = adults + children;
                            
                            return (
                              <>
                                {totalGuests}
                                {children > 0 ? (
                                  <span className="ml-1 text-xs text-slate-500">
                                    ({adults}A, {children}C)
                                  </span>
                                ) : null}
                              </>
                            );
                          }
                        }
                        
                        // No guest data available
                        return "-";
                      })()}
                    </td>
                    <td className="py-4 font-medium text-slate-900">
                      ${booking.total_amount}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {booking.stripe_payment_intent_id ? (
                        <span className="text-xs text-green-600">✓ Paid</span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No payment
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {booking.stripe_payment_intent_id && (
                          <button
                            onClick={() => handleDelete(booking.id, true)}
                            disabled={deletingId === booking.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === booking.id
                              ? "..."
                              : "Delete & Refund"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(booking.id, false)}
                          disabled={deletingId === booking.id}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {deletingId === booking.id ? "..." : "Delete Only"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-600">
            Total bookings: <span className="font-semibold">{bookings.length}</span>
          </p>
          <button
            onClick={fetchBookings}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

