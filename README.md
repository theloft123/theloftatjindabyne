## The Loft @ Jindabyne

A password-protected rental property microsite showcasing availability, pricing, photo gallery, and property highlights for The Loft @ Jindabyne.

### Features
- Password gate for guest-only access (stores successful unlocks in `localStorage`)
- Admin mode with Supabase-backed content editing, pricing controls, and password rotation
- Hero, gallery, and detailed amenities sections tailored to the property
- Booking panel with date-range picker, minimum night enforcement, and weekday/weekend pricing breakdown
- Checkout call-to-action ready for future Stripe integration
- Supabase client scaffolded for persisting bookings and content

### Tech Stack
- [Next.js 15 App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Day Picker](https://react-day-picker.dev/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/start)

### Getting Started
Install dependencies:
```bash
npm install
```

Add a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_ACCESS_PASSWORD=theloft2025
ADMIN_PANEL_PASSWORD=theloft-admin
ADMIN_SESSION_SECRET=change-me-please
NEXT_PUBLIC_SUPABASE_URL=https://hjixtvrbeqthaepwltqh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaXh0dnJiZXF0aGFlcHdsdHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjYzMTAsImV4cCI6MjA3ODM0MjMxMH0.xhHk8vqnAbs9YCs170_IGr9vZrMeqgPuUQdGFvqjnqY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaXh0dnJiZXF0aGFlcHdsdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc2NjMxMCwiZXhwIjoyMDc4MzQyMzEwfQ.57r7IhAYlNJUBXj6ynKqkexUlNkqtAFujif6Xxla87M
```

> **Security note:** Keep `.env.local` out of source control. Rotate the service-role key before deploying production workloads, restrict RLS policies accordingly, and replace the sample secrets before launch.

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

### Next Steps
- Connect the checkout CTA to a Stripe Checkout Session or Payment Link.
- Model bookings, blocked dates, and pricing tables in Supabase and hydrate the booking panel.
- Replace the placeholder Unsplash imagery with high-resolution property photography.
- Configure deployment (Vercel or similar) and set environment variables in the hosting platform.
