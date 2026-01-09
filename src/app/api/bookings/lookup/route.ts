import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookings";

/**
 * Look up bookings by email (for guest cancellation)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const allBookings = await getAllBookings();
    const guestBookings = allBookings.filter(
      (booking) =>
        booking.guest_email.toLowerCase() === email.toLowerCase() &&
        (booking.status === "confirmed" || booking.status === "pending")
    );

    // Only return future bookings or recent past bookings (within last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const relevantBookings = guestBookings.filter((booking) => {
      const checkIn = new Date(booking.check_in_date);
      return checkIn >= thirtyDaysAgo;
    });

    return NextResponse.json({
      bookings: relevantBookings.map((b) => ({
        id: b.id,
        check_in_date: b.check_in_date,
        check_out_date: b.check_out_date,
        total_amount: b.total_amount,
        status: b.status,
        guest_name: b.guest_name,
      })),
    });
  } catch (error: any) {
    console.error("Error looking up bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to lookup bookings" },
      { status: 500 }
    );
  }
}
