import { DAY_SLOTS } from "../data/slots.ts";
import type { DaySlot, SlotId } from "../types.ts";

/** SAST is UTC+2 with no daylight saving. */
const SAST_OFFSET = "+02:00";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  return (
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Build a TIMESTAMPTZ instant from a SAST calendar date and wall-clock time. */
export function sastDateTime(
  isoDate: string,
  hour: number,
  minute: number,
): Date {
  return new Date(
    `${isoDate}T${pad(hour)}:${pad(minute)}:00${SAST_OFFSET}`,
  );
}

export function slotWindow(
  isoDate: string,
  slot: DaySlot,
): { start: Date; end: Date } {
  return {
    start: sastDateTime(isoDate, slot.startHour, slot.startMinute),
    end: sastDateTime(isoDate, slot.endHour, slot.endMinute),
  };
}

export function findSlot(slotId: SlotId): DaySlot | undefined {
  return DAY_SLOTS.find((slot) => slot.id === slotId);
}

/** Today's calendar date in SAST, YYYY-MM-DD. */
export function todaySast(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isPastSlot(isoDate: string, slot: DaySlot): boolean {
  const { start } = slotWindow(isoDate, slot);
  return start.getTime() <= Date.now();
}

/** Inclusive SAST day bounds as TIMESTAMPTZ instants, for Free/Busy queries. */
export function sastDayBounds(isoDate: string): { start: Date; end: Date } {
  return {
    start: sastDateTime(isoDate, 0, 0),
    end: sastDateTime(isoDate, 23, 59),
  };
}
