import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookings";
import { sendCheckInReminderToGuest, sendCheckInReminderToHost } from "@/lib/emails";
import { verifyAdminSessionToken } from "@/lib/security";

/**
 * Test endpoint to send check-in reminder emails for a specific booking
 * Requires admin authentication
 * 
 * Usage: GET /api/cron/reminders/test?bookingId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required. Use admin session token." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json(
        { error: "Invalid or expired admin session token" },
        { status: 401 }
      );
    }

    // Get booking ID from query params
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId query parameter is required" },
        { status: 400 }
      );
    }

    // Find the booking
    const bookings = await getAllBookings();
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Send reminder emails
    const results: { recipient: string; success: boolean; error?: string }[] = [];

    // Send to guest
    try {
      await sendCheckInReminderToGuest(booking);
      results.push({ recipient: booking.guest_email, success: true });
    } catch (error: any) {
      results.push({
        recipient: booking.guest_email,
        success: false,
        error: error.message,
      });
    }

    // Send to host
    try {
      await sendCheckInReminderToHost(booking);
      results.push({ recipient: "host (owner email)", success: true });
    } catch (error: any) {
      results.push({
        recipient: "host (owner email)",
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Test reminder emails sent",
      booking: {
        id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
      },
      results,
    });
  } catch (error: any) {
    console.error("Error in test reminder endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test reminders" },
      { status: 500 }
    );
  }
}
