import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookings";

/**
 * Verify email matches booking (for guest cancellation)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const bookings = await getAllBookings();
    const booking = bookings.find((b) => b.id === id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Case-insensitive email comparison
    if (booking.guest_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ verified: false }, { status: 200 });
    }

    return NextResponse.json({ verified: true, booking });
  } catch (error: any) {
    console.error("Error verifying booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify booking" },
      { status: 500 }
    );
  }
}
