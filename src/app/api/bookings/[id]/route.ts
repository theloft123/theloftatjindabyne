import { NextRequest, NextResponse } from "next/server";
import { deleteBooking } from "@/lib/bookings";
import { stripe } from "@/lib/stripe";

/**
 * Delete a booking (admin only)
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
    const { getAllBookings } = await import("@/lib/bookings");
    const allBookings = await getAllBookings();
    const booking = allBookings.find((b) => b.id === id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Process refund if requested and payment intent exists
    if (refund && booking.stripe_payment_intent_id) {
      try {
        const refundResult = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          reason: "requested_by_customer",
        });
        console.log("Refund created:", refundResult.id);
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

    return NextResponse.json({
      success: true,
      refunded: refund && !!booking.stripe_payment_intent_id,
    });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}

