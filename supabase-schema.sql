-- Supabase schema for The Loft at Jindabyne
-- Run this SQL in your Supabase SQL Editor

-- Table for storing password hashes (guest and admin)
create table if not exists site_security (
  id text primary key default 'singleton',
  guest_password_hash text not null,
  admin_password_hash text not null,
  updated_at timestamptz default now()
);

-- Table for storing all site content (hero, gallery, details, bookings)
create table if not exists site_content (
  id text primary key default 'singleton',
  content jsonb not null,
  updated_at timestamptz default now()
);

-- Optional: Add indexes for better performance
create index if not exists idx_site_security_id on site_security(id);
create index if not exists idx_site_content_id on site_content(id);

-- Optional: Add updated_at trigger to automatically update timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_site_security_updated_at
  before update on site_security
  for each row
  execute function update_updated_at_column();

create trigger update_site_content_updated_at
  before update on site_content
  for each row
  execute function update_updated_at_column();

-- Note: Bookings/reservations are stored in the site_content.content JSONB field
-- as a 'reservations' array. This keeps everything in one place and simplifies
-- the schema. If you need more advanced querying later, you can create a separate
-- bookings table and migrate the data.

-- The bookings section of site_content includes:
--   - blockedDates: Array of manually blocked date ranges
--   - weekdayRate, weekendRate: Base pricing
--   - cleaningFee: One-time fee per booking
--   - minimumNights, maximumNights: Stay length limits
--   - customRates: Special pricing for date ranges (holidays, peak season)
--   - dayOfWeekRates: Override rates for specific days
--   - occupancyPricing: Extra adult charges
--   - panelText: Customizable booking panel text
--   - maxAdvanceBookingMonths: Rolling limit on how far in advance guests can book (default: 9 months)

