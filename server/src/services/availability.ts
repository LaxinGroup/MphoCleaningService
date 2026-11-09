import { DAILY_BOOKING_CAP, DAY_SLOTS } from "../data/slots.ts";
import { db } from "../db/client.ts";
import { isPastSlot, slotWindow } from "../lib/sast.ts";
import type { AvailabilityResult, SlotAvailability, SlotId } from "../types.ts";
import { isSlotBusyOnCalendar } from "./calendar.ts";

export async function checkDayAvailability(
  isoDate: string,
): Promise<AvailabilityResult> {
  const [bookingCount, existing] = await Promise.all([
    db.countBookingsOnDate(isoDate),
    db.listBookingsOnDate(isoDate),
  ]);

  const remaining = Math.max(0, DAILY_BOOKING_CAP - bookingCount);
  const capReached = remaining === 0;
  const takenSlots = new Set(existing.map((booking) => booking.slotId));

  const slots: SlotAvailability[] = await Promise.all(
    DAY_SLOTS.map(async (slot) => {
      const { start, end } = slotWindow(isoDate, slot);
      const base: Omit<SlotAvailability, "available" | "reason"> = {
        slotId: slot.id,
        label: slot.label,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      };

      if (isPastSlot(isoDate, slot)) {
        return { ...base, available: false, reason: "past" };
      }
      if (capReached) {
        return { ...base, available: false, reason: "daily_cap" };
      }
      if (takenSlots.has(slot.id)) {
        return { ...base, available: false, reason: "booked" };
      }

      const busy = await isSlotBusyOnCalendar(start, end);
      if (busy) {
        return { ...base, available: false, reason: "calendar_busy" };
      }

      return { ...base, available: true, reason: "open" };
    }),
  );

  return {
    date: isoDate,
    timezone: "Africa/Johannesburg",
    dailyCap: DAILY_BOOKING_CAP,
    bookingCount,
    remaining,
    capReached,
    slots,
  };
}

export async function assertSlotOpen(
  isoDate: string,
  slotId: SlotId,
): Promise<{ start: Date; end: Date }> {
  const day = await checkDayAvailability(isoDate);
  const slot = day.slots.find((item) => item.slotId === slotId);
  if (!slot) {
    throw new Error("Unknown time slot.");
  }
  if (!slot.available) {
    const messages: Record<SlotAvailability["reason"], string> = {
      open: "Slot is available.",
      daily_cap: "This day already has three bookings.",
      booked: "That time window is already booked.",
      calendar_busy: "The calendar is busy in that window.",
      past: "That time window has already passed.",
    };
    throw Object.assign(new Error(messages[slot.reason]), {
      code: slot.reason,
    });
  }
  return { start: new Date(slot.startAt), end: new Date(slot.endAt) };
}
