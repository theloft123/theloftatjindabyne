## The Loft @ Jindabyne

A password-protected rental property microsite showcasing availability, pricing, photo gallery, and property highlights for The Loft @ Jindabyne.

### Features
- Password gate for guest-only access (stores successful unlocks in `localStorage`) test
- Admin mode with Supabase-backed content editing, pricing controls, and password rotation
- Hero, gallery, and detailed amenities sections tailored to the property
- Booking panel with date-range picker, minimum night enforcement, and weekday/weekend pricing breakdown
- **Stripe Checkout integration** for secure payment processing
- Dynamic pricing with weekday/weekend rates, custom date ranges, and occupancy fees
- Webhook handling for automatic booking confirmation
- **Email notifications** via Resend for booking confirmations, cancellations, and refunds
- Supabase client for persisting bookings and content

### Tech Stack
- [Next.js 15 App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Day Picker](https://react-day-picker.dev/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/start)
- [Stripe](https://stripe.com) - Payment processing
- [Resend](https://resend.com) - Transactional email service

### Getting Started
Install dependencies:
```bash
npm install
```

Add a `.env.local` file in the project root:
```bash
# App Passwords
NEXT_PUBLIC_ACCESS_PASSWORD=theloft2025
ADMIN_PANEL_PASSWORD=theloftadmin
ADMIN_SESSION_SECRET=change-me-please

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hjixtvrbeqthaepwltqh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaXh0dnJiZXF0aGFlcHdsdHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjYzMTAsImV4cCI6MjA3ODM0MjMxMH0.xhHk8vqnAbs9YCs170_IGr9vZrMeqgPuUQdGFvqjnqY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaXh0dnJiZXF0aGFlcHdsdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc2NjMxMCwiZXhwIjoyMDc4MzQyMzEwfQ.57r7IhAYlNJUBXj6ynKqkexUlNkqtAFujif6Xxla87M

# Stripe Payment Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Notifications (Resend) 
RESEND_KEY=re_your_resend_api_key_here
OWNER_EMAIL=your-email@example.com
RESEND_FROM_EMAIL=The Loft @ Jindabyne <noreply@theloftatjindabyne.com.au>  # Optional: requires domain verification
```

> **Security note:** Keep `.env.local` out of source control. Rotate the service-role key before deploying production workloads, restrict RLS policies accordingly, and replace the sample secrets before launch.

### Stripe Setup

To enable payment processing:

1. **Create a [Stripe account](https://stripe.com)**

2. **Get your API keys** from [Stripe Dashboard > Developers > API keys](https://dashboard.stripe.com/apikeys):
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)
   - Use test keys during development, live keys (`pk_live_`, `sk_live_`) for production

3. **Set up webhooks** for payment confirmation:
   
   **For local development:**
   - Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - Run: `stripe login`
   - Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the webhook secret (starts with `whsec_`) to `.env.local` as `STRIPE_WEBHOOK_SECRET`
   
   **For production:**
   - Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed` (required)
   - Copy the signing secret to your production environment variables

4. **Add keys to `.env.local`** (see environment variables section above)

#### Testing Stripe Integration

1. Start your app: `npm run dev`
2. If testing locally, start the Stripe webhook listener (in a separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Visit your site and make a test booking
4. Use Stripe's test card: `4242 4242 4242 4242` with any future expiry, any CVC, any postal code
5. Check Stripe Dashboard > Payments to see the test transaction
6. Check your app's admin panel to verify the booking was created
7. Verify webhook events in Stripe Dashboard > Developers > Webhooks > Recent deliveries (should show 200 response)

#### Enabling Live Mode (Production)

⚠️ **Only do this when you're ready to accept real payments!**

1. Activate your Stripe account (may require business verification)
2. Switch to **Live mode** in Stripe Dashboard (toggle in top right)
3. Get your **live API keys** (`pk_live_...`, `sk_live_...`)
4. Create a **production webhook endpoint** at `https://yourdomain.com/api/stripe/webhook`
5. Update production environment variables with live keys
6. Deploy your app with the live keys


### Email Notifications (Resend) Setup

To enable email notifications:

1. **Create a [Resend account](https://resend.com)** (free tier: 3,000 emails/month)
2. **Get your API key** from [Resend Dashboard > API Keys](https://resend.com/api-keys)
3. **Domain verification (required for production):**
   
   **Option A: Verify your domain (recommended for production)**
   - Go to [Resend Dashboard > Domains](https://resend.com/domains)
   - Click **Add Domain**
   - Enter `theloftatjindabyne.com.au`
   - Add the DNS records Resend provides to your domain registrar
   - Wait for verification (usually 5-15 minutes)
   - Once verified, you can use `noreply@theloftatjindabyne.com.au`
   
   **Option B: Use Resend's default domain (testing only)**
   - For testing, you can use Resend's default sender: `onboarding@resend.dev`
   - Update `RESEND_FROM_EMAIL` in `.env.local` to: `The Loft @ Jindabyne <onboarding@resend.dev>`
   - ⚠️ Limited to sending to your own verified email address
   
4. **Add to `.env.local`**:
   ```bash
   RESEND_KEY=re_your_api_key_here
   OWNER_EMAIL=your-email@example.com
   RESEND_FROM_EMAIL=The Loft @ Jindabyne <noreply@theloftatjindabyne.com.au>
   ```

**Note about Resend webhooks:** You don't need Resend webhooks for basic email sending. Resend webhooks are optional and only needed if you want to track email events (delivered, opened, clicked, bounced). For booking confirmations, basic email sending is sufficient.

#### Testing Email Notifications

**Quick Test Method:**
1. Make sure your app is running and Stripe webhook listener is active
2. Create a test booking with your real email address
3. Complete checkout with test card `4242 4242 4242 4242`
4. Check your email inbox (and spam folder) for:
   - Guest confirmation email (to the email you entered)
   - Host notification email (to `OWNER_EMAIL`)

**Check Server Logs:**
Watch your terminal for:
- ✅ `Booking created successfully: [booking-id]`
- ✅ `Booking confirmation email sent to [email]`
- ✅ `Booking notification email sent to [email]`
- ❌ `Failed to send guest confirmation email: [error]` (if errors occur)

**Check Resend Dashboard:**
1. Go to [Resend Dashboard > Emails](https://resend.com/emails)
2. You should see a log of all emails sent
3. Status should show: ✅ **Delivered** (success) or ❌ **Failed** (check error)

**Testing Cancellation Emails:**
1. Create a test booking (as above)
2. Get the booking ID from admin panel or confirmation email URL
3. Cancel the booking (via admin panel or cancellation link)
4. Check emails for cancellation confirmations (guest and host)

#### Troubleshooting Email Issues

**Domain Not Verified:**
- Check [Resend Dashboard > Domains](https://resend.com/domains) for verification status
- Verify DNS records (SPF, DKIM, DMARC) are correctly added
- DNS propagation can take 5-60 minutes (sometimes up to 24-48 hours)
- Use DNS checker tools like [whatsmydns.net](https://www.whatsmydns.net/) to verify records are public
- While troubleshooting, you can use `onboarding@resend.dev` for testing

**"RESEND_KEY is not set" Error:**
- Check `.env.local` has `RESEND_KEY=re_...`
- Restart development server after adding variables
- In production, verify environment variable is set in Vercel/hosting platform

**Emails Not Received:**
- Check spam/junk folder
- Check [Resend Dashboard > Emails](https://resend.com/emails) to see if emails were sent
- Check server logs for error messages
- Verify recipient email address is correct
- New domains may have lower deliverability initially

**Booking Created but No Email:**
- Check if webhook was received (look for "Booking created successfully" in logs)
- Check Stripe Dashboard > Webhooks > Recent deliveries
- Look for "Failed to send..." messages in server logs
- Check Resend Dashboard for failed emails

**Domain Verified but Emails Still Failing:**
- Verify `RESEND_FROM_EMAIL` format is correct: `The Loft @ Jindabyne <noreply@theloftatjindabyne.com.au>`
- Check API key is correct (try regenerating in Resend Dashboard)
- Check rate limits (free tier: 3,000 emails/month)


#### Test Cards

When testing in **test mode**, use Stripe's test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`
- Use any future expiry date, any 3-digit CVC, and any postal code

#### Stripe Dashboard Links

- [Payments](https://dashboard.stripe.com/payments) - View all transactions
- [Customers](https://dashboard.stripe.com/customers) - Manage customer records
- [Webhooks](https://dashboard.stripe.com/webhooks) - Monitor webhook deliveries
- [Logs](https://dashboard.stripe.com/logs) - Debug API requests
- [Settings > Branding](https://dashboard.stripe.com/settings/branding) - Customize checkout appearance
- [Coupons](https://dashboard.stripe.com/coupons) - Create discount codes

#### Currency

The integration is configured for **AUD (Australian Dollars)**. To change:
1. Edit `src/app/api/stripe/checkout/route.ts`
2. Find `currency: "aud"` and change to your desired currency (e.g., `"usd"`, `"gbp"`, `"eur"`)

### Supabase schema

Create the following tables (run via the Supabase SQL editor):

```sql
create table if not exists site_security (
  id text primary key default 'singleton',
  guest_password_hash text not null,
  admin_password_hash text not null,
  updated_at timestamptz default now()
);

create table if not exists site_content (
  id text primary key default 'singleton',
  content jsonb not null,
  updated_at timestamptz default now()
);
```

Both tables are initialised automatically on first use with the default passwords/content provided in your environment variables. Add Row Level Security policies if you plan to expose additional clients; the current setup relies on the service role key within Next.js route handlers.

Start the development server:
```bash
npm run dev
```
The site will be available at [http://localhost:3000](http://localhost:3000).

### Production Deployment Checklist

⚠️ **Before going live, ensure all environment variables are set in your hosting platform (e.g., Vercel):**

**Required Environment Variables:**
- All Stripe keys (live mode keys for production)
- All Supabase keys
- All Resend/Email keys
- App passwords and secrets
- Set `RESEND_FROM_EMAIL` to your verified domain email

**Stripe:**
- Activate Stripe account (may require business verification)
- Switch to Live mode in Stripe Dashboard
- Get live API keys (`pk_live_...`, `sk_live_...`)
- Create production webhook endpoint
- Test with a small real payment before going fully live

**Email:**
- Verify domain in Resend Dashboard
- Set production `RESEND_FROM_EMAIL` to verified domain
- Test email delivery in production

### Refunds

Guests can cancel bookings and request refunds:
- **Cancellation link** included in confirmation emails
- **Admin panel** allows cancellation with optional refund
- Refunds processed via Stripe and take 5-10 business days
- Automatic cancellation emails sent to guest and host

### Next Steps
- ✅ ~~Connect the checkout CTA to a Stripe Checkout Session~~ **DONE!**
- ✅ ~~Model bookings, blocked dates, and pricing tables in Supabase~~ **DONE!**
- ✅ ~~Set up Stripe webhooks for automatic booking confirmation~~ **DONE!**
- ✅ ~~Add email notifications for booking confirmations~~ **DONE!**
- Replace the placeholder Unsplash imagery with high-resolution property photography
- Configure deployment (Vercel or similar) and set environment variables in the hosting platform

### Useful Stripe Documentation

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Refunds API](https://stripe.com/docs/refunds)
- [Coupons & Promotion Codes](https://stripe.com/docs/billing/subscriptions/coupons)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Security Best Practices](https://stripe.com/docs/security/guide)

### Payment Features

The app includes comprehensive pricing logic:
- **Dynamic nightly rates** - Different rates for weekdays vs weekends
- **Custom date ranges** - Set special pricing for holidays or peak seasons
- **Day-of-week rates** - Configure specific rates for each day of the week
- **Occupancy pricing** - Charge extra for additional guests over base occupancy
- **Cleaning fees** - One-time cleaning charge per booking
- **Minimum/maximum nights** - Enforce stay duration requirements
- **Promotion codes** - Guests can apply discount codes at checkout

**📖 See [STRIPE_COUPONS.md](./STRIPE_COUPONS.md) for detailed coupon/promotion code setup guide.**

All pricing is calculated in real-time based on the selected dates and guest count before the customer proceeds to Stripe Checkout.

#### Payment Flow

1. **Guest selects dates** → App calculates total price with dynamic rates
2. **Guest enters details** → Name, email, phone, guest count
3. **Guest clicks checkout** → App creates Stripe Checkout Session
4. **Stripe processes payment** → Guest enters card details on Stripe's secure page
5. **Webhook notification** → Stripe sends `checkout.session.completed` event
6. **Booking created** → App creates reservation in Supabase
7. **Confirmation emails sent** → Guest and host receive booking confirmations
8. **Success page** → Guest redirected to `/booking/success` with booking details

### Troubleshooting Stripe Issues

#### "STRIPE_SECRET_KEY is not set" error
- Make sure `.env.local` exists and contains your Stripe keys
- Restart your development server after adding variables

#### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` matches your endpoint's signing secret
- Check that the webhook URL is correct
- Verify the Stripe CLI is running (for local development)

#### Booking created but payment not showing
- Check [Stripe Dashboard > Payments](https://dashboard.stripe.com/payments)
- Verify webhook was received ([Developers > Webhooks > Recent deliveries](https://dashboard.stripe.com/webhooks))
- Check your server logs for errors

#### Test payment works but booking not created
- Ensure webhook endpoint is accessible
- Check webhook secret is correct
- Look at server logs for database errors
- Verify webhook events include `checkout.session.completed`

### Security Best Practices

✅ **Already implemented:**
- Webhook signature verification
- Server-side payment processing (no card data touches your server)
- Environment variable protection
- Availability checks before payment
- HTTPS required in production

🔒 **Additional recommendations:**
- Enable [Stripe Radar](https://stripe.com/docs/radar) for fraud detection
- Monitor webhook failures in Stripe Dashboard
- Set up webhook retry alerts
- Use strong Supabase RLS policies
- Rotate API keys regularly
