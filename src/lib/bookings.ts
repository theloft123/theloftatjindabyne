import { getSiteContent, updateSiteContent, type SiteContent } from "./siteContent";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Reservation = SiteContent["reservations"][number];

export type CreateBookingInput = {
  check_in_date: string;
  check_out_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  total_amount: number;
  weekday_nights: number;
  weekend_nights: number;
  cleaning_fee: number;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  notes?: string;
};

/**
 * Check if a date range conflicts with existing reservations
 */
export async function checkDateAvailability(
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string
): Promise<{ available: boolean; conflictingReservations: Reservation[] }> {
  const content = await getSiteContent();
  const activeStatuses: BookingStatus[] = ["pending", "confirmed", "completed"];

  const conflicting = content.reservations.filter((reservation: Reservation) => {
    if (excludeReservationId && reservation.id === excludeReservationId) {
      return false;
    }
    if (!activeStatuses.includes(reservation.status)) {
      return false;
    }
    // Check if dates overlap
    return (
      reservation.check_in_date <= checkOut &&
      reservation.check_out_date >= checkIn
    );
  });

  return {
    available: conflicting.length === 0,
    conflictingReservations: conflicting,
  };
}

/**
 * Create a new reservation
 */
export async function createBooking(input: CreateBookingInput): Promise<Reservation> {
  // First check availability
  const availability = await checkDateAvailability(
    input.check_in_date,
    input.check_out_date
  );

  if (!availability.available) {
    throw new Error(
      "Selected dates conflict with an existing booking. Please choose different dates."
    );
  }

  const content = await getSiteContent();
  const newReservation: Reservation = {
    id: crypto.randomUUID(),
    check_in_date: input.check_in_date,
    check_out_date: input.check_out_date,
    guest_name: input.guest_name,
    guest_email: input.guest_email,
    guest_phone: input.guest_phone,
    total_amount: input.total_amount,
    weekday_nights: input.weekday_nights,
    weekend_nights: input.weekend_nights,
    cleaning_fee: input.cleaning_fee,
    status: "pending",
    stripe_payment_intent_id: input.stripe_payment_intent_id,
    stripe_customer_id: input.stripe_customer_id,
    notes: input.notes,
    created_at: new Date().toISOString(),
  };

  const updatedContent: SiteContent = {
    ...content,
    reservations: [...content.reservations, newReservation],
  };

  await updateSiteContent(updatedContent);
  return newReservation;
}

/**
 * Get all reservations (admin only)
 */
export async function getAllBookings(): Promise<Reservation[]> {
  const content = await getSiteContent();
  return [...content.reservations].sort(
    (a: Reservation, b: Reservation) => a.check_in_date.localeCompare(b.check_in_date)
  );
}

/**
 * Get reservations for a date range
 */
export async function getBookingsInRange(
  startDate: string,
  endDate: string
): Promise<Reservation[]> {
  const content = await getSiteContent();
  const activeStatuses: BookingStatus[] = ["pending", "confirmed", "completed"];

  return content.reservations
    .filter((reservation: Reservation) => {
      if (!activeStatuses.includes(reservation.status)) {
        return false;
      }
      return (
        reservation.check_in_date <= endDate &&
        reservation.check_out_date >= startDate
      );
    })
    .sort((a: Reservation, b: Reservation) => a.check_in_date.localeCompare(b.check_in_date));
}

/**
 * Update reservation status
 */
export async function updateBookingStatus(
  reservationId: string,
  status: BookingStatus,
  notes?: string
): Promise<Reservation> {
  const content = await getSiteContent();
  const index = content.reservations.findIndex((r: Reservation) => r.id === reservationId);

  if (index === -1) {
    throw new Error(`Reservation ${reservationId} not found`);
  }

  const updated: Reservation = {
    ...content.reservations[index],
    status,
    ...(notes !== undefined && { notes }),
  };

  const updatedContent: SiteContent = {
    ...content,
    reservations: [
      ...content.reservations.slice(0, index),
      updated,
      ...content.reservations.slice(index + 1),
    ],
  };

  await updateSiteContent(updatedContent);
  return updated;
}

/**
 * Update Stripe payment info for a reservation
 */
export async function updateBookingPayment(
  reservationId: string,
  stripePaymentIntentId: string,
  stripeCustomerId?: string
): Promise<Reservation> {
  const content = await getSiteContent();
  const index = content.reservations.findIndex((r: Reservation) => r.id === reservationId);

  if (index === -1) {
    throw new Error(`Reservation ${reservationId} not found`);
  }

  const updated: Reservation = {
    ...content.reservations[index],
    stripe_payment_intent_id: stripePaymentIntentId,
    status: "confirmed",
    ...(stripeCustomerId && { stripe_customer_id: stripeCustomerId }),
  };

  const updatedContent: SiteContent = {
    ...content,
    reservations: [
      ...content.reservations.slice(0, index),
      updated,
      ...content.reservations.slice(index + 1),
    ],
  };

  await updateSiteContent(updatedContent);
  return updated;
}

/**
 * Delete a reservation (admin only)
 */
export async function deleteBooking(reservationId: string): Promise<void> {
  const content = await getSiteContent();
  const filtered = content.reservations.filter((r: Reservation) => r.id !== reservationId);

  if (filtered.length === content.reservations.length) {
    throw new Error(`Reservation ${reservationId} not found`);
  }

  const updatedContent: SiteContent = {
    ...content,
    reservations: filtered,
  };

  await updateSiteContent(updatedContent);
}
