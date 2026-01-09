import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAllBookings } from "@/lib/bookings";

/**
 * Retrieve Stripe checkout session details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Try to find the booking by email and check-in date
    let bookingId = null;
    if (session.metadata?.guestEmail && session.metadata?.checkInDate) {
      const bookings = await getAllBookings();
      const booking = bookings.find(
        (b) =>
          b.guest_email.toLowerCase() === session.metadata.guestEmail.toLowerCase() &&
          b.check_in_date === session.metadata.checkInDate
      );
      if (booking) {
        bookingId = booking.id;
      }
    }

    return NextResponse.json({
      id: session.id,
      status: session.status,
      customer: session.customer,
      payment_intent: session.payment_intent,
      metadata: {
        ...session.metadata,
        bookingId,
      },
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

