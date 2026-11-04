import type { DaySlot } from "../types.ts";

/** Solo operator: three named windows per SAST day, matching the 3-booking cap. */
export const DAY_SLOTS: readonly DaySlot[] = [
  {
    id: "morning",
    label: "08:00 – 11:00",
    startHour: 8,
    startMinute: 0,
    endHour: 11,
    endMinute: 0,
  },
  {
    id: "midday",
    label: "12:00 – 15:00",
    startHour: 12,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
  },
  {
    id: "afternoon",
    label: "15:30 – 18:30",
    startHour: 15,
    startMinute: 30,
    endHour: 18,
    endMinute: 30,
  },
] as const;

export const DAILY_BOOKING_CAP = 3;
export const SAST_TIMEZONE = "Africa/Johannesburg";
