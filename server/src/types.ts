export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  data: null;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ServiceAccent =
  | "laundry"
  | "home"
  | "windows"
  | "floor"
  | "office"
  | "garden"
  | "extra";

export type ServiceCategory = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  accent: ServiceAccent;
  sortOrder: number;
  services: ServiceItem[];
};

export type ServiceItem = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  priceLabel: string;
  priceFromCents: number | null;
  sortOrder: number;
};

export type SlotId = "morning" | "midday" | "afternoon";

export type DaySlot = {
  id: SlotId;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

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

export type BookingRecord = {
  id: string;
  serviceId: number;
  serviceIds: number[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string | null;
  notes: string | null;
  bookingDate: string;
  slotId: SlotId;
  slotStart: string;
  slotEnd: string;
  status: "confirmed" | "cancelled";
  googleEventId: string | null;
  createdAt: string;
};
