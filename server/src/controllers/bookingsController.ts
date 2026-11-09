import type { Request, Response } from "express";
import { z } from "zod";
import { calendarConfigured, env } from "../config/env.ts";
import { DAILY_BOOKING_CAP } from "../data/slots.ts";
import { db } from "../db/client.ts";
import { sendFail, sendOk } from "../lib/http.ts";
import { findSlot, isIsoDate } from "../lib/sast.ts";
import { assertSlotOpen } from "../services/availability.ts";
import {
  deleteCalendarEvent,
  insertCalendarEvent,
} from "../services/calendar.ts";

const bodySchema = z.object({
  serviceId: z.number().int().positive().optional(),
  serviceIds: z
    .array(z.number().int().positive())
    .min(1)
    .refine((serviceIds) => new Set(serviceIds).size === serviceIds.length, {
      message: "A service can only be selected once.",
    })
    .optional(),
  date: z.string().refine(isIsoDate, "date must be YYYY-MM-DD in SAST"),
  slotId: z.enum(["morning", "midday", "afternoon"]),
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.email(),
  customerPhone: z.string().trim().min(10).max(20),
  address: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
}).transform((payload, context) => {
  const serviceIds = payload.serviceIds ?? (
    payload.serviceId === undefined ? [] : [payload.serviceId]
  );
  if (serviceIds.length === 0) {
    context.addIssue({
      code: "custom",
      message: "Select at least one service.",
      path: ["serviceIds"],
    });
  }
  return { ...payload, serviceIds };
});

export async function createBooking(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendFail(res, 400, parsed.error.issues[0]?.message ?? "Invalid booking.");
    return;
  }

  const payload = parsed.data;
  const selectedServices = await Promise.all(
    payload.serviceIds.map((serviceId) => db.getService(serviceId)),
  );
  if (selectedServices.some((service) => service === null)) {
    sendFail(res, 404, "That service is not on the list.");
    return;
  }
  const services = selectedServices.filter((service) => service !== null);

  let window: { start: Date; end: Date };
  try {
    window = await assertSlotOpen(payload.date, payload.slotId);
  } catch (error) {
    sendFail(
      res,
      409,
      error instanceof Error ? error.message : "That slot is not available.",
    );
    return;
  }

  if (!calendarConfigured && !env.isDev) {
    sendFail(
      res,
      503,
      "Bookings cannot be confirmed until Google Calendar is connected.",
    );
    return;
  }

  // Calendar write first so a failed Neon insert can delete the event.
  let googleEventId: string | null = null;
  if (!calendarConfigured) {
    console.warn(
      "[mupho:calendar] GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY missing — " +
        "booking saved to Neon only (dev mode). Set NODE_ENV=production in prod.",
    );
  }
  if (calendarConfigured) {
    const slot = findSlot(payload.slotId);
    const whatsappDigits = payload.customerPhone
      .replace(/\D/g, "")
      .replace(/^0/, "27");
    const serviceSummary = services.map((service) => service.name).join(", ");
    googleEventId = await insertCalendarEvent({
      summary: `${payload.customerName} — ${serviceSummary} (${slot?.label ?? payload.slotId})`,
      description: [
        `Customer: ${payload.customerName}`,
        `Date: ${payload.date}`,
        `Time window: ${slot?.label ?? payload.slotId} (SAST)`,
        `Cell: ${payload.customerPhone}`,
        `WhatsApp: ${payload.customerPhone}  →  https://wa.me/${whatsappDigits}`,
        `Email: ${payload.customerEmail}`,
        ...services.map(
          (service) => `Service: ${service.name} (${service.priceLabel})`,
        ),
        `Address: ${payload.address ?? "Not provided"}`,
        payload.notes ? `Notes: ${payload.notes}` : null,
        "Payment: cash / invoice / on delivery — no card checkout.",
      ]
        .filter(Boolean)
        .join("\n"),
      start: window.start,
      end: window.end,
      attendeeEmail: payload.customerEmail,
      attendeeName: payload.customerName,
    });
  }

  try {
    const inserted = await db.insertBookingIfUnderCap(
      {
        serviceId: payload.serviceIds[0],
        serviceIds: payload.serviceIds,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        address: payload.address ?? null,
        notes: payload.notes ?? null,
        bookingDate: payload.date,
        slotId: payload.slotId,
        slotStart: window.start,
        slotEnd: window.end,
        googleEventId,
      },
      DAILY_BOOKING_CAP,
    );

    if (inserted === "cap" || inserted === "slot_taken") {
      if (googleEventId) {
        await deleteCalendarEvent(googleEventId);
      }
      sendFail(
        res,
        409,
        inserted === "cap"
          ? "This day already has three bookings."
          : "That time window was just taken.",
      );
      return;
    }

    sendOk(res, inserted, "Booking confirmed.", 201);
  } catch (error) {
    if (googleEventId) {
      await deleteCalendarEvent(googleEventId);
    }
    throw error;
  }
}
