import { NextRequest, NextResponse } from "next/server";
import { deleteBooking, getAllBookings } from "@/lib/bookings";
import { stripe } from "@/lib/stripe";
import { verifyAdminSessionToken } from "@/lib/security";
import {
  sendCancellationToGuest,
  sendCancellationToHost,
} from "@/lib/emails";

/**
 * Get a single booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookings = await getAllBookings();
    const booking = bookings.find((b) => b.id === id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

/**
 * Delete a booking (admin only or guest with email verification)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const refund = searchParams.get("refund") === "true";

    // Get the booking before deleting to access payment info
    const allBookings = await getAllBookings();
    const booking = allBookings.find((b) => b.id === id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Determine if cancelled by admin or guest
    const authHeader = request.headers.get("authorization");
    const isAdminCancellation =
      authHeader?.startsWith("Bearer ") &&
      verifyAdminSessionToken(authHeader.split(" ")[1]);
    const cancelledByGuest = !isAdminCancellation;

    // Process refund if requested and payment intent exists
    let refundProcessed = false;
    if (refund && booking.stripe_payment_intent_id) {
      try {
        const refundResult = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          reason: "requested_by_customer",
        });
        console.log("Refund created:", refundResult.id);
        refundProcessed = true;
      } catch (refundError: any) {
        console.error("Refund failed:", refundError);
        return NextResponse.json(
          { error: `Booking deleted but refund failed: ${refundError.message}` },
          { status: 500 }
        );
      }
    }

    // Delete the booking
    await deleteBooking(id);

    // Send cancellation emails
    try {
      await sendCancellationToGuest(booking, refundProcessed);
    } catch (emailError) {
      console.error("Failed to send guest cancellation email:", emailError);
      // Don't fail the request if email fails
    }

    try {
      await sendCancellationToHost(booking, refundProcessed, cancelledByGuest);
    } catch (emailError) {
      console.error("Failed to send host cancellation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      refunded: refundProcessed,
    });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}
