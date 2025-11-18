import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookings";

/**
 * Get all bookings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    const bookings = await getAllBookings();
    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

