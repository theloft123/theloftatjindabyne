import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { checkDateAvailability } from "@/lib/bookings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
      guestPhone,
      adults,
      childrenUnder12,
      totalAmount,
      weekdayNights,
      weekendNights,
      cleaningFee,
      occupancyFee,
    } = body;

    // Validate required fields
    if (
      !checkInDate ||
      !checkOutDate ||
      !guestName ||
      !guestEmail ||
      !totalAmount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check availability before creating payment intent
    const availability = await checkDateAvailability(checkInDate, checkOutDate);
    if (!availability.available) {
      return NextResponse.json(
        {
          error: "Selected dates are no longer available",
          conflictingReservations: availability.conflictingReservations,
        },
        { status: 409 }
      );
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: guestEmail,
      limit: 1,
    });

    let customer: any;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: guestEmail,
        name: guestName,
        phone: guestPhone,
        metadata: {
          source: "theloft_booking",
        },
      });
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: "The Loft at Jindabyne - Accommodation",
              description: `${checkInDate} to ${checkOutDate} (${weekdayNights + weekendNights} nights)`,
              images: [
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200",
              ],
            },
            unit_amount: Math.round(
              (totalAmount - cleaningFee - (occupancyFee || 0)) * 100
            ), // Convert to cents
          },
          quantity: 1,
        },
        ...(cleaningFee > 0
          ? [
              {
                price_data: {
                  currency: "aud",
                  product_data: {
                    name: "Cleaning & Preparation Fee",
                  },
                  unit_amount: Math.round(cleaningFee * 100),
                },
                quantity: 1,
              },
            ]
          : []),
        ...(occupancyFee && occupancyFee > 0
          ? [
              {
                price_data: {
                  currency: "aud",
                  product_data: {
                    name: "Additional Guest Fee",
                    description: `Extra adults: ${Math.floor(occupancyFee / weekdayNights)}`,
                  },
                  unit_amount: Math.round(occupancyFee * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/?cancelled=true`,
      metadata: {
        checkInDate,
        checkOutDate,
        guestName,
        guestEmail,
        guestPhone: guestPhone || "",
        adults: adults?.toString() || "2",
        childrenUnder12: childrenUnder12?.toString() || "0",
        totalAmount: totalAmount.toString(),
        weekdayNights: weekdayNights.toString(),
        weekendNights: weekendNights.toString(),
        cleaningFee: cleaningFee.toString(),
        occupancyFee: (occupancyFee || 0).toString(),
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

