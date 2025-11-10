import { supabaseServer } from "./supabaseServer";

const CONTENT_TABLE = "site_content";
const CONTENT_ROW_ID = "singleton";

export type SiteContent = {
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
  };
  gallery: Array<{
    src: string;
    alt: string;
  }>;
  details: {
    introHeading: string;
    introCopy: string;
    highlights: Array<{
      title: string;
      highlight: string;
      description: string;
    }>;
    amenities: string[];
  };
  bookings: {
    blockedDates: Array<{ start: string; end: string; note?: string }>;
    weekdayRate: number;
    weekendRate: number;
    cleaningFee: number;
    minimumNights: number;
    maximumNights: number | null;
    customRates: Array<{
      id: string;
      startDate: string;
      endDate: string;
      rate: number;
      label: string;
    }>;
    dayOfWeekRates: {
      monday?: number;
      tuesday?: number;
      wednesday?: number;
      thursday?: number;
      friday?: number;
      saturday?: number;
      sunday?: number;
    };
  };
  reservations: Array<{
    id: string;
    check_in_date: string;
    check_out_date: string;
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    total_amount: number;
    weekday_nights: number;
    weekend_nights: number;
    cleaning_fee: number;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    stripe_payment_intent_id?: string;
    stripe_customer_id?: string;
    notes?: string;
    created_at: string;
  }>;
};

type SiteContentRecord = {
  id: string;
  content: SiteContent;
  updated_at: string | null;
};

const defaultContent: SiteContent = {
  hero: {
    eyebrow: "Luxury alpine retreat",
    headline: "The Loft at Jindabyne",
    description:
      "Elevated living above Lake Jindabyne with panoramic views, crafted interiors, and the Snowy Mountains on your doorstep.",
  },
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
      alt: "Sunset over Lake Jindabyne viewed from an elevated terrace",
    },
    {
      src: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
      alt: "Scandinavian loft interior with timber accents and mountain views",
    },
    {
      src: "https://images.unsplash.com/photo-1522708323590-1063cf0f74d6?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern kitchen and dining area bathed in natural light",
    },
    {
      src: "https://images.unsplash.com/photo-1505692794403-34cb7c508e08?auto=format&fit=crop&w=1200&q=80",
      alt: "Inviting bedroom with plush linens and soft lighting",
    },
  ],
  details: {
    introHeading: "Alpine luxury made for unwinding together",
    introCopy:
      "The Loft at Jindabyne is a three-storey escape designed for groups who crave space, comfort, and uninterrupted lake vistas. Thoughtful zoning keeps the living, sleeping, and gear-drop zones distinct, so every guest can move at their own pace after days on the slopes or the trails.",
    highlights: [
      {
        title: "Sleeps",
        highlight: "Up to 8 guests",
        description:
          "Three spacious bedrooms plus a flexible loft retreat, all dressed with premium linen.",
      },
      {
        title: "Location",
        highlight: "Heart of Jindabyne",
        description:
          "Moments from the lakefront, cafés, and the Snowy Mountains Highway for quick resort access.",
      },
      {
        title: "Design",
        highlight: "Architecturally crafted",
        description:
          "Soaring timber ceilings, polished concrete floors, and panoramic glazing frame alpine vistas.",
      },
    ],
    amenities: [
      "Luxury bedding & heated flooring",
      "Indoor fireplace & outdoor firepit",
      "Chef's kitchen with butler's pantry",
      "Smart home climate control",
      "Dedicated mudroom & ski storage",
      "High-speed Wi-Fi & Sonos audio",
    ],
  },
  bookings: {
    blockedDates: [],
    weekdayRate: 520,
    weekendRate: 590,
    cleaningFee: 220,
    minimumNights: 2,
    maximumNights: null,
    customRates: [],
    dayOfWeekRates: {},
  },
  reservations: [],
};

export async function getSiteContent() {
  const { data, error } = await supabaseServer
    .from<SiteContentRecord>(CONTENT_TABLE)
    .select("*")
    .eq("id", CONTENT_ROW_ID)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") {
      // no row, seed below
    } else if (error.code === "42P01") {
      throw new Error(
        "Supabase table 'site_content' does not exist. Please run the provided SQL migration."
      );
    } else {
      throw new Error(`Failed to read site content: ${error.message}`);
    }
  }

  if (data) {
    return data.content;
  }

  const { data: inserted, error: insertError } = await supabaseServer
    .from<SiteContentRecord>(CONTENT_TABLE)
    .upsert({
      id: CONTENT_ROW_ID,
      content: defaultContent,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to seed site content: ${insertError.message}`);
  }

  return inserted.content;
}

export async function updateSiteContent(content: SiteContent) {
  const { error } = await supabaseServer
    .from<SiteContentRecord>(CONTENT_TABLE)
    .update({ content })
    .eq("id", CONTENT_ROW_ID);

  if (error) {
    throw new Error(`Failed to update site content: ${error.message}`);
  }
}

