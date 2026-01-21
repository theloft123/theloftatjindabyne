import { resend } from "./resend";
import type { Reservation } from "./bookings";
import { format } from "date-fns";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "jack.francis.aus@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.theloftatjindabyne.com.au";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "The Loft @ Jindabyne <noreply@theloftatjindabyne.com.au>";

/**
 * Send booking confirmation email to guest
 */
export async function sendBookingConfirmationToGuest(
  booking: Reservation
): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const cancellationUrl = `${SITE_URL}/booking/cancel/${booking.id}`;
  const checkInDate = format(new Date(booking.check_in_date), "EEEE, MMMM d, yyyy");
  const checkOutDate = format(new Date(booking.check_out_date), "EEEE, MMMM d, yyyy");
  const totalNights = booking.weekday_nights + booking.weekend_nights;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.guest_email,
      subject: `Booking Confirmed - The Loft @ Jindabyne`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to bottom right, #1e293b, #334155); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${booking.guest_name},</p>
            
            <p style="font-size: 16px;">Your booking at The Loft @ Jindabyne has been confirmed. We're excited to host you!</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-in:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkInDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-out:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Nights:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${totalNights} night${totalNights !== 1 ? 's' : ''}</td>
                </tr>
                ${booking.adults ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Guests:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${booking.adults} adult${booking.adults !== 1 ? 's' : ''}${booking.children_under_12 ? `, ${booking.children_under_12} child${booking.children_under_12 !== 1 ? 'ren' : ''} (under 12)` : ''}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Total Paid:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 18px;">$${booking.total_amount.toFixed(2)} AUD</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #166534; font-weight: 600;">✓ Payment received and confirmed</p>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Important Information</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li style="margin-bottom: 8px;">Self check-in from 3:00pm</li>
                <li style="margin-bottom: 8px;">Check-out by 10:00am</li>
                <li style="margin-bottom: 8px;">All linen and cleaning fees are included</li>
              </ul>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #92400e; font-size: 18px;">Need to Cancel?</h3>
              <p style="color: #78350f; margin-bottom: 15px;">If you need to cancel your booking, you can do so using the link below. Refunds are available for cancellations.</p>
              <a href="${cancellationUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">Cancel Your Booking</a>
            </div>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              If you have any questions, please contact us at <a href="mailto:${OWNER_EMAIL}" style="color: #3b82f6;">${OWNER_EMAIL}</a> or call <a href="tel:+61497162289" style="color: #3b82f6;">+61 497 162 289</a>.
            </p>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 15px;">
              We look forward to welcoming you to The Loft @ Jindabyne!
            </p>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Booking confirmation email sent to ${booking.guest_email}`);
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    throw error;
  }
}

/**
 * Send booking notification email to host
 */
export async function sendBookingNotificationToHost(
  booking: Reservation
): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const checkInDate = format(new Date(booking.check_in_date), "EEEE, MMMM d, yyyy");
  const checkOutDate = format(new Date(booking.check_out_date), "EEEE, MMMM d, yyyy");
  const totalNights = booking.weekday_nights + booking.weekend_nights;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `New Booking - ${booking.guest_name} - ${checkInDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to bottom right, #1e293b, #334155); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Booking Received</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">A new booking has been confirmed and payment has been received.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Guest Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Name:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${booking.guest_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;"><a href="mailto:${booking.guest_email}" style="color: #3b82f6;">${booking.guest_email}</a></td>
                </tr>
                ${booking.guest_phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;"><a href="tel:${booking.guest_phone}" style="color: #3b82f6;">${booking.guest_phone}</a></td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-in:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkInDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-out:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Nights:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${totalNights} night${totalNights !== 1 ? 's' : ''}</td>
                </tr>
                ${booking.adults ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Guests:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${booking.adults} adult${booking.adults !== 1 ? 's' : ''}${booking.children_under_12 ? `, ${booking.children_under_12} child${booking.children_under_12 !== 1 ? 'ren' : ''} (under 12)` : ''}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 18px;">$${booking.total_amount.toFixed(2)} AUD</td>
                </tr>
                ${booking.stripe_payment_intent_id ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Payment ID:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500; font-family: monospace; font-size: 12px;">${booking.stripe_payment_intent_id}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #166534; font-weight: 600;">✓ Payment received and confirmed</p>
            </div>
            
            ${booking.notes ? `
            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #78350f;"><strong>Notes:</strong> ${booking.notes}</p>
            </div>
            ` : ''}
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Booking notification email sent to ${OWNER_EMAIL}`);
  } catch (error) {
    console.error("Failed to send booking notification email:", error);
    throw error;
  }
}

/**
 * Send cancellation confirmation email to guest
 */
export async function sendCancellationToGuest(
  booking: Reservation,
  refunded: boolean
): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const checkInDate = format(new Date(booking.check_in_date), "EEEE, MMMM d, yyyy");
  const checkOutDate = format(new Date(booking.check_out_date), "EEEE, MMMM d, yyyy");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.guest_email,
      subject: `Booking Cancelled - The Loft @ Jindabyne`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancelled</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to bottom right, #dc2626, #ef4444); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Cancelled</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${booking.guest_name},</p>
            
            <p style="font-size: 16px;">Your booking at The Loft @ Jindabyne has been cancelled as requested.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Cancelled Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-in:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkInDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-out:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Original Amount:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">$${booking.total_amount.toFixed(2)} AUD</td>
                </tr>
              </table>
            </div>
            
            ${refunded ? `
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #166534; font-weight: 600;">✓ Refund Processed</p>
              <p style="margin: 10px 0 0 0; color: #166534;">A refund of $${booking.total_amount.toFixed(2)} AUD has been processed and will be credited back to your original payment method within 5-10 business days.</p>
            </div>
            ` : `
            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #78350f;">No refund was processed for this cancellation.</p>
            </div>
            `}
            
            <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              If you have any questions, please contact us at <a href="mailto:${OWNER_EMAIL}" style="color: #3b82f6;">${OWNER_EMAIL}</a> or call <a href="tel:+61497162289" style="color: #3b82f6;">+61 497 162 289</a>.
            </p>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 15px;">
              We hope to welcome you to The Loft @ Jindabyne in the future!
            </p>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Cancellation email sent to ${booking.guest_email}`);
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    throw error;
  }
}

/**
 * Send cancellation notification email to host
 */
export async function sendCancellationToHost(
  booking: Reservation,
  refunded: boolean,
  cancelledByGuest: boolean = true
): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const checkInDate = format(new Date(booking.check_in_date), "EEEE, MMMM d, yyyy");
  const checkOutDate = format(new Date(booking.check_out_date), "EEEE, MMMM d, yyyy");
  const cancelledBy = cancelledByGuest ? "Guest" : "Admin/Owner";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `Booking Cancelled - ${booking.guest_name} - ${checkInDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancelled</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to bottom right, #dc2626, #ef4444); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Cancelled</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">A booking has been cancelled.</p>
            
            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #78350f;"><strong>Cancelled by:</strong> ${cancelledBy}</p>
            </div>
            
            <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Guest Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Name:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${booking.guest_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;"><a href="mailto:${booking.guest_email}" style="color: #3b82f6;">${booking.guest_email}</a></td>
                </tr>
                ${booking.guest_phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;"><a href="tel:${booking.guest_phone}" style="color: #3b82f6;">${booking.guest_phone}</a></td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #f8fafc; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Cancelled Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-in:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkInDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-out:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Original Amount:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">$${booking.total_amount.toFixed(2)} AUD</td>
                </tr>
              </table>
            </div>
            
            ${refunded ? `
            <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: 600;">⚠ Refund Processed</p>
              <p style="margin: 10px 0 0 0; color: #991b1b;">A refund of $${booking.total_amount.toFixed(2)} AUD has been processed and will be returned to the guest's payment method.</p>
            </div>
            ` : `
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #166534;">No refund was processed for this cancellation.</p>
            </div>
            `}
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Cancellation notification email sent to ${OWNER_EMAIL}`);
  } catch (error) {
    console.error("Failed to send cancellation notification email:", error);
    throw error;
  }
}

/**
 * Send check-in reminder email to guest (1 week before)
 */
export async function sendCheckInReminderToGuest(
  booking: Reservation
): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const checkInDate = format(new Date(booking.check_in_date), "dd/MM/yyyy");
  const checkOutDate = format(new Date(booking.check_out_date), "dd/MM/yyyy");
  const totalNights = booking.weekday_nights + booking.weekend_nights;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.guest_email,
      subject: `Your Stay at The Loft @ Jindabyne - Check-in Details`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Check-in Details</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to bottom right, #1e293b, #334155); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Not Long Now!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">Hello!</p>
            
            <p style="font-size: 16px;">Not long now until your stay at The Loft @ Jindabyne. Your check-in date is <strong>${checkInDate}</strong> with check-out on <strong>${checkOutDate}</strong>; staying a total of <strong>${totalNights} night${totalNights !== 1 ? 's' : ''}</strong>.</p>
            
            <p style="font-size: 16px;">A few quick notes for your stay:</p>
            
            <!-- Linen Section -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #92400e; font-size: 18px;">🛏️ Linen</h2>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                <li style="margin-bottom: 8px;"><strong>Don't forget</strong> to bring your own linen including sheets, pillowcases and towels!</li>
                <li style="margin-bottom: 0;">Bedding configurations are listed on the <a href="${SITE_URL}" style="color: #b45309;">website</a></li>
              </ul>
            </div>
            
            <!-- Access Section -->
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e40af; font-size: 18px;">🔑 Access</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #1e40af; font-weight: 600; width: 120px;">Check-in:</td>
                  <td style="padding: 6px 0; color: #1e3a8a;">1:00pm</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #1e40af; font-weight: 600;">Check-out:</td>
                  <td style="padding: 6px 0; color: #1e3a8a;">11:00am</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #1e40af; font-weight: 600;">Address:</td>
                  <td style="padding: 6px 0; color: #1e3a8a;">Unit 3, 28 Ingebyra Street, Jindabyne</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #1e40af; font-weight: 600;">Parking:</td>
                  <td style="padding: 6px 0; color: #1e3a8a;">The first 2 off street carparks are allocated to our unit</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #1e40af; font-weight: 600;">Entry:</td>
                  <td style="padding: 6px 0; color: #1e3a8a;">Head up the concrete stairs and you will see the front door to Unit 3</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #1e40af; font-weight: 600;">Door code:</td>
                  <td style="padding: 6px 0; color: #1e3a8a; font-weight: 700; font-size: 18px;">1950</td>
                </tr>
              </table>
            </div>
            
            <!-- Check-Out Section -->
            <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 18px;">🧹 Check-Out</h2>
              <p style="margin-top: 0; color: #475569;">Please clean the apartment before you leave. Cleaning products are under the sink in the kitchen and in the hallway cupboard:</p>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li style="margin-bottom: 6px;">Clean the main bathroom and toilet upstairs</li>
                <li style="margin-bottom: 6px;">Wash bathmat, handtowels and tea towels. Place on the towel rail in the bathroom to dry.</li>
                <li style="margin-bottom: 6px;">Vacuum carpeted areas and mop tiled areas</li>
                <li style="margin-bottom: 6px;">Empty bins and remove perishables from the fridge</li>
                <li style="margin-bottom: 6px;">Wipe down surfaces</li>
                <li style="margin-bottom: 6px;">Clean the kitchen including unstacking the dishwasher and emptying the drying rack</li>
              </ul>
              <p style="margin-bottom: 0; color: #64748b; font-style: italic;">Please note, how you leave the apartment is how the next guests will find it.</p>
            </div>
            
            <!-- General Section -->
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #166534; font-size: 18px;">📶 General</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #166534; font-weight: 600; width: 120px;">Wifi Network:</td>
                  <td style="padding: 6px 0; color: #15803d; font-weight: 500;">Winderie</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #166534; font-weight: 600;">Wifi Password:</td>
                  <td style="padding: 6px 0; color: #15803d; font-weight: 500;">Rotella01</td>
                </tr>
              </table>
              <p style="margin-top: 15px; margin-bottom: 0; color: #166534;"><strong>Supplies:</strong> If anything is running low (e.g. butter, toilet paper, cleaning products), please let us know so we can replace when we next visit.</p>
            </div>
            
            <p style="font-size: 16px; color: #333;">If you have any questions please let us know, otherwise we hope you enjoy your stay!</p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 5px;">Regards,</p>
            <p style="font-size: 16px; color: #333; margin-top: 0;"><strong>Jack and Nicole</strong></p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 14px; color: #64748b; margin: 5px 0;">
                <strong>Jack:</strong> <a href="tel:0497162289" style="color: #3b82f6;">0497 162 289</a>
              </p>
              <p style="font-size: 14px; color: #64748b; margin: 5px 0;">
                <strong>Nicole:</strong> <a href="tel:0431260688" style="color: #3b82f6;">0431 260 688</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Check-in reminder email sent to ${booking.guest_email}`);
  } catch (error) {
    console.error("Failed to send check-in reminder email:", error);
    throw error;
  }
}

/**
 * Send check-in reminder notification to host (1 week before)
 */
export async function sendCheckInReminderToHost(
  booking: Reservation
): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const checkInDate = format(new Date(booking.check_in_date), "EEEE, MMMM d, yyyy");
  const checkOutDate = format(new Date(booking.check_out_date), "EEEE, MMMM d, yyyy");
  const totalNights = booking.weekday_nights + booking.weekend_nights;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `Upcoming Check-in (1 Week) - ${booking.guest_name} - ${checkInDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Upcoming Check-in</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to bottom right, #0891b2, #06b6d4); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Upcoming Check-in</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">1 Week Away</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">A guest is checking in one week from now. A reminder email has been sent to them with check-in details.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #0891b2; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Guest Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Name:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${booking.guest_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;"><a href="mailto:${booking.guest_email}" style="color: #3b82f6;">${booking.guest_email}</a></td>
                </tr>
                ${booking.guest_phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;"><a href="tel:${booking.guest_phone}" style="color: #3b82f6;">${booking.guest_phone}</a></td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-in:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkInDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Check-out:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Nights:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${totalNights} night${totalNights !== 1 ? 's' : ''}</td>
                </tr>
                ${booking.adults ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Guests:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${booking.adults} adult${booking.adults !== 1 ? 's' : ''}${booking.children_under_12 ? `, ${booking.children_under_12} child${booking.children_under_12 !== 1 ? 'ren' : ''} (under 12)` : ''}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 18px;">$${booking.total_amount.toFixed(2)} AUD</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #166534; font-weight: 600;">✓ Guest reminder email sent</p>
              <p style="margin: 10px 0 0 0; color: #166534;">The guest has been sent their check-in details including the door code, WiFi password, and check-out instructions.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Check-in reminder notification sent to ${OWNER_EMAIL}`);
  } catch (error) {
    console.error("Failed to send check-in reminder to host:", error);
    throw error;
  }
}
