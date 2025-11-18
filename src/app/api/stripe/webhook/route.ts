import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createBooking } from "@/lib/bookings";
import Stripe from "stripe";

/**
 * Stripe webhook endpoint for handling payment events
 * This must be configured in your Stripe Dashboard
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const metadata = session.metadata;
        if (!metadata) {
          console.error("No metadata in checkout session");
          break;
        }

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
        } = metadata;

        // Get payment intent details
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        // Create the booking in the database
        const booking = await createBooking({
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          total_amount: parseFloat(totalAmount),
          weekday_nights: parseInt(weekdayNights, 10),
          weekend_nights: parseInt(weekendNights, 10),
          cleaning_fee: parseFloat(cleaningFee),
          stripe_payment_intent_id: paymentIntentId,
          stripe_customer_id: session.customer as string,
          status: "confirmed", // Payment succeeded, so booking is confirmed
          notes: `Adults: ${adults}, Children (under 12): ${childrenUnder12}${
            occupancyFee && parseFloat(occupancyFee) > 0
              ? `, Occupancy Fee: $${occupancyFee}`
              : ""
          }`,
        });

        console.log("Booking created successfully:", booking.id);

        // TODO: Send confirmation email to guest
        // TODO: Send notification to property owner

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        // TODO: Handle failed payment (send notification, etc.)
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: `Webhook processing failed: ${error.message}` },
      { status: 500 }
    );
  }
}

