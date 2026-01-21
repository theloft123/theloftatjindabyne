import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Simple keep-alive endpoint to prevent Supabase from pausing
 * Runs daily via Vercel Cron
 */
export async function GET() {
  try {
    // Simple query to keep database active
    const { data, error } = await supabaseServer
      .from("site_content")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Keep-alive query failed:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("Keep-alive ping successful");
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Database is active",
    });
  } catch (error: any) {
    console.error("Keep-alive error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
