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
    occupancyPricing: {
      enabled: boolean;
      baseOccupancy: number;
      maxOccupancy: number;
      perAdultRate: number;
      description?: string;
    };
    panelText?: {
      eyebrow: string;
      heading: string;
      description: string;
      detail1: string;
      detail2: string;
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
    adults?: number;
    children_under_12?: number;
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
    eyebrow: "Snowy Mountains Retreat",
    headline: "The Loft @ Jindabyne",
    description:
      "A two bedroom apartment with a loft and lake views located 500 meters from the Jindabyne township. Restaurants, bars, cafes and shops are only a 10 minute walk away. The perfect base for winter and summer activities in the Snowy Mountains region.",
  },
  gallery: [
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/12.png",
      alt: "The Loft @ Jindabyne - Overall atmosphere",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/11.png",
      alt: "The Loft @ Jindabyne - Evening ambiance",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/10.png",
      alt: "The Loft @ Jindabyne - Detail shot",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/9.png",
      alt: "The Loft @ Jindabyne - Amenities",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/8.png",
      alt: "The Loft @ Jindabyne - Lake view",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/7.png",
      alt: "The Loft @ Jindabyne - Outdoor space",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/6.png",
      alt: "The Loft @ Jindabyne - Bathroom",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/5.png",
      alt: "The Loft @ Jindabyne - Bedroom",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/4.png",
      alt: "The Loft @ Jindabyne - Kitchen and dining",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/3.png",
      alt: "The Loft @ Jindabyne - Living area",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/2.png",
      alt: "The Loft @ Jindabyne - Interior space",
    },
    {
      src: "https://hjixtvrbeqthaepwltqh.supabase.co/storage/v1/object/public/images/1.png",
      alt: "The Loft @ Jindabyne - Property view",
    },
  ],
  details: {
    introHeading: "About The Loft @ Jindabyne",
    introCopy:
      "The Loft @ Jindabyne is a two bedroom apartment with a loft and lake views located 500 meters from the Jindabyne township. Restaurants, bars, cafes and shops are only a 10 minute walk away. The perfect base for winter and summer activities in the Snowy Mountains region.",
    highlights: [
      {
        title: "Sleeps",
        highlight: "Up to 8 guests",
        description:
          "Bedroom 1: Queen • Bedroom 2 (Bunk Room): 1 x Double and 3 x Singles • Loft front: Queen • Loft back: 2 x Singles",
      },
      {
        title: "Location",
        highlight: "500m from township",
        description:
          "3/28 Ingebyra Street, Jindabyne 2627. Restaurants, bars, cafes and shops are a 10 minute walk away.",
      },
      {
        title: "Check-in / Check-out",
        highlight: "1:00 pm / 11:00 am",
        description:
          "Self check-in with door code provided prior to arrival. Cancel until 14 days before check-in for full refund.",
      },
    ],
    amenities: [
      "Lake views from apartment",
      "Self check-in with door code",
      "BBQ in carport (with battery light)",
      "5 toboggans available for snow play",
      "Kids ski gear collection available",
      "Doonas, pillows and blankets provided",
      "BYO linen (sheets, pillow cases, towels)",
      "No smoking, no pets, no parties",
      "Available to friends & family only",
      "Please clean before departure",
      "Vacuum carpets & mop tiles",
      "Clean bathroom & empty bins",
      "Unstack dishwasher & wipe surfaces",
      "Kids ski gear in hallway cupboard",
      "Cleaning products under sink",
      "Loft access via steep ladder",
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
    occupancyPricing: {
      enabled: false,
      baseOccupancy: 2,
      maxOccupancy: 8,
      perAdultRate: 50,
      description: "Base rate includes 2 guests. Additional adults (12+) charged per night.",
    },
    panelText: {
      eyebrow: "Availability & Pricing",
      heading: "Plan your stay",
      description: "Select your arrival and departure dates to view the current rate. Weekends attract a premium, while longer mid-week stays are rewarded with our best nightly pricing.",
      detail1: "Self check-in from 3:00pm, check-out by 10:00am",
      detail2: "Rates include all linen, cleaning fee, and local taxes",
    },
  },
  reservations: [],
};

export async function getSiteContent() {
  const { data, error } = await supabaseServer
    .from(CONTENT_TABLE)
    .select("*")
    .eq("id", CONTENT_ROW_ID)
    .maybeSingle<SiteContentRecord>();

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
    .from(CONTENT_TABLE)
    .upsert({
      id: CONTENT_ROW_ID,
      content: defaultContent,
    })
    .select("*")
    .single<SiteContentRecord>();

  if (insertError) {
    throw new Error(`Failed to seed site content: ${insertError.message}`);
  }

  return inserted.content;
}

export async function updateSiteContent(content: SiteContent) {
  const { error } = await supabaseServer
    .from(CONTENT_TABLE)
    .update({ content })
    .eq("id", CONTENT_ROW_ID);

  if (error) {
    throw new Error(`Failed to update site content: ${error.message}`);
  }
}

