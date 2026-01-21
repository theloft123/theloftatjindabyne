import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookings";
import { sendCheckInReminderToGuest, sendCheckInReminderToHost } from "@/lib/emails";
import { addDays, format, parseISO, startOfDay } from "date-fns";

/**
 * Cron job to send check-in reminder emails
 * Runs daily and sends reminders to guests checking in 7 days from now
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (in production)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // In production, verify the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all confirmed bookings
    const bookings = await getAllBookings();
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

    // Calculate the date 7 days from now
    const today = startOfDay(new Date());
    const reminderDate = addDays(today, 7);
    const reminderDateStr = format(reminderDate, "yyyy-MM-dd");

    console.log(`Checking for bookings with check-in on ${reminderDateStr}`);

    // Find bookings with check-in 7 days from now
    const bookingsToRemind = confirmedBookings.filter((booking) => {
      const checkInDate = format(parseISO(booking.check_in_date), "yyyy-MM-dd");
      return checkInDate === reminderDateStr;
    });

    console.log(`Found ${bookingsToRemind.length} booking(s) to send reminders for`);

    // Send reminder emails
    const results: { email: string; type: string; success: boolean; error?: string }[] = [];

    for (const booking of bookingsToRemind) {
      // Send to guest
      try {
        await sendCheckInReminderToGuest(booking);
        results.push({ email: booking.guest_email, type: "guest", success: true });
      } catch (error: any) {
        console.error(`Failed to send reminder to ${booking.guest_email}:`, error);
        results.push({
          email: booking.guest_email,
          type: "guest",
          success: false,
          error: error.message,
        });
      }

      // Send to host
      try {
        await sendCheckInReminderToHost(booking);
        results.push({ email: "host", type: "host", success: true });
      } catch (error: any) {
        console.error(`Failed to send host reminder:`, error);
        results.push({
          email: "host",
          type: "host",
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} reminder(s), ${failureCount} failed`,
      reminderDate: reminderDateStr,
      results,
    });
  } catch (error: any) {
    console.error("Error in reminder cron job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process reminders" },
      { status: 500 }
    );
  }
}
