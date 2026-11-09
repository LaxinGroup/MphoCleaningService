export type ServiceAccent =
  | "laundry"
  | "home"
  | "windows"
  | "floor"
  | "office"
  | "garden"
  | "extra";

export type ServiceItem = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  priceLabel: string;
  priceFromCents: number | null;
  sortOrder: number;
};

export type ServiceCategory = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  accent: ServiceAccent;
  sortOrder: number;
  services: ServiceItem[];
};

export type ServicesPayload = {
  pickupNote: string;
  dropOff: {
    address: string;
    whatsapp: string;
    whatsappE164: string;
  };
  categories: ServiceCategory[];
};

export type SlotId = "morning" | "midday" | "afternoon";

export type SlotAvailability = {
  slotId: SlotId;
  label: string;
  startAt: string;
  endAt: string;
  available: boolean;
  reason: "open" | "daily_cap" | "booked" | "calendar_busy" | "past";
};

export type AvailabilityResult = {
  date: string;
  timezone: "Africa/Johannesburg";
  dailyCap: number;
  bookingCount: number;
  remaining: number;
  capReached: boolean;
  slots: SlotAvailability[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};
