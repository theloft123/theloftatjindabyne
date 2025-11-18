# Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payments for The Loft @ Jindabyne booking system.

## Prerequisites

- A Stripe account ([sign up at stripe.com](https://stripe.com))
- Access to your Stripe Dashboard
- The Loft app running locally or deployed

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on **Developers** in the left sidebar
3. Click on **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode, click "Reveal test key")

## Step 2: Add Stripe Keys to Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important Notes:**
- Use **test keys** (starting with `pk_test_` and `sk_test_`) during development
- Use **live keys** (starting with `pk_live_` and `sk_live_`) in production
- Never commit your `.env.local` file to version control
- The webhook secret will be obtained in Step 3

## Step 3: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your app when payments are completed.

### For Local Development (using Stripe CLI):

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)

2. Log in to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhook events to your local app:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. The CLI will display your webhook signing secret (starts with `whsec_`). Copy this to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

5. Keep the Stripe CLI running in a separate terminal while testing

### For Production (Stripe Dashboard):

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)

2. Click **Add endpoint**

3. Set the endpoint URL to:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

4. Select events to listen to:
   - `checkout.session.completed` (required)
   - `payment_intent.succeeded` (optional)
   - `payment_intent.payment_failed` (optional)

5. Click **Add endpoint**

6. Click on your newly created endpoint and reveal the **Signing secret**

7. Add this secret to your production environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 4: Test the Integration

### Test Mode Testing:

1. Start your app:
   ```bash
   npm run dev
   ```

2. If testing locally, start the Stripe webhook listener (in a separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Visit your site and try to make a booking

4. Use Stripe's test card numbers:
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **3D Secure:** `4000 0025 0000 3155`
   - Use any future expiry date, any 3-digit CVC, and any postal code

5. Check your Stripe Dashboard > Payments to see the test transaction

6. Check your app's admin panel to verify the booking was created

### Verify Webhook Events:

In your Stripe Dashboard:
- Go to **Developers > Webhooks**
- Click on your endpoint
- View the **Recent deliveries** to see webhook attempts
- Successful deliveries should show a 200 response code

## Step 5: Enable Live Mode (Production)

⚠️ **Only do this when you're ready to accept real payments!**

1. Activate your Stripe account (may require business verification)

2. Switch to **Live mode** in your Stripe Dashboard (toggle in top right)

3. Get your **live API keys**:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

4. Create a **production webhook endpoint** (see Step 3)

5. Update your production environment variables:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   STRIPE_SECRET_KEY=sk_live_your_live_key
   STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
   ```

6. Deploy your app with the live keys

## Payment Flow Overview

Here's what happens when a guest books:

1. **Guest selects dates** → App calculates total price with dynamic rates
2. **Guest enters details** → Name, email, phone, guest count
3. **Guest clicks checkout** → App creates Stripe Checkout Session via `/api/stripe/checkout`
4. **Stripe processes payment** → Guest enters card details on Stripe's secure page
5. **Webhook notification** → Stripe sends `checkout.session.completed` to `/api/stripe/webhook`
6. **Booking created** → App creates reservation in Supabase
7. **Confirmation page** → Guest redirected to `/booking/success` with booking details

## Pricing Configuration

Your app already handles complex pricing:

- ✅ **Weekday/Weekend rates** - Different nightly rates
- ✅ **Custom date ranges** - Special pricing for holidays/peak seasons
- ✅ **Day-of-week rates** - Specific rates for each day
- ✅ **Occupancy pricing** - Extra charges for additional guests
- ✅ **Cleaning fees** - One-time cleaning charge
- ✅ **Minimum nights** - Enforced in booking logic

All pricing is calculated **before** checkout and passed to Stripe, ensuring the correct amount is charged.

## Currency

The integration is configured for **AUD (Australian Dollars)**. To change this:

1. Edit `src/app/api/stripe/checkout/route.ts`
2. Find `currency: "aud"`
3. Change to your desired currency code (e.g., `"usd"`, `"gbp"`, `"eur"`)

## Security Best Practices

✅ **Already implemented:**
- Webhook signature verification
- Server-side payment processing
- Environment variable protection
- Availability checks before payment

🔒 **Additional recommendations:**
- Use strong Supabase RLS policies
- Enable Stripe Radar for fraud detection
- Set up email notifications for new bookings
- Monitor webhook failures in Stripe Dashboard
- Use HTTPS in production (required by Stripe)

## Troubleshooting

### "STRIPE_SECRET_KEY is not set" error
- Make sure `.env.local` exists and contains your Stripe keys
- Restart your development server after adding variables

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` matches your endpoint's signing secret
- Check that the webhook URL is correct
- Verify the Stripe CLI is running (for local development)

### Booking created but payment not showing
- Check Stripe Dashboard > Payments
- Verify webhook was received (Developers > Webhooks > Recent deliveries)
- Check your server logs for errors

### Test payment works but booking not created
- Ensure webhook endpoint is accessible
- Check webhook secret is correct
- Look at server logs for database errors

## Email Notifications (TODO)

Currently, the webhook handler includes TODO comments for:
- Sending confirmation emails to guests
- Sending notifications to property owners

Consider integrating:
- [Resend](https://resend.com) - Modern email API
- [SendGrid](https://sendgrid.com) - Established email service
- [Postmark](https://postmarkapp.com) - Transactional emails

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

## Stripe Dashboard Quick Links

- [Payments](https://dashboard.stripe.com/payments) - View all transactions
- [Customers](https://dashboard.stripe.com/customers) - Manage customer records
- [Webhooks](https://dashboard.stripe.com/webhooks) - Monitor webhook deliveries
- [Logs](https://dashboard.stripe.com/logs) - Debug API requests
- [Settings > Branding](https://dashboard.stripe.com/settings/branding) - Customize checkout appearance

