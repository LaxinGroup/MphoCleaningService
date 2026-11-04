import { google, type calendar_v3 } from "googleapis";
import { calendarConfigured, env } from "../config/env.ts";

function calendarClient(): calendar_v3.Calendar {
  if (!env.googleClientEmail || !env.googlePrivateKey) {
    throw new Error("Google Calendar service account is not configured.");
  }

  const auth = new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    subject: env.googleImpersonateEmail,
  });

  return (google.calendar as any)({ version: "v3", auth }) as calendar_v3.Calendar;
}

function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: string,
  endB: string,
): boolean {
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  return startA.getTime() < bEnd && endA.getTime() > bStart;
}

export async function isSlotBusyOnCalendar(
  start: Date,
  end: Date,
): Promise<boolean> {
  if (!calendarConfigured) {
    return false;
  }

  const calendar = calendarClient();
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: "Africa/Johannesburg",
      items: [{ id: env.googleCalendarId }],
    },
  });

  const busy =
    response.data.calendars?.[env.googleCalendarId]?.busy ?? [];

  return busy.some((block: calendar_v3.Schema$TimePeriod) => {
    if (!block.start || !block.end) return false;
    return rangesOverlap(start, end, block.start, block.end);
  });
}

export type CalendarEventInput = {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  attendeeEmail: string;
  attendeeName: string;
};

export async function insertCalendarEvent(
  input: CalendarEventInput,
): Promise<string> {
  const calendar = calendarClient();

  const requestBody: calendar_v3.Schema$Event = {
    summary: input.summary,
    description: input.description,
    start: {
      dateTime: input.start.toISOString(),
      timeZone: "Africa/Johannesburg",
    },
    end: {
      dateTime: input.end.toISOString(),
      timeZone: "Africa/Johannesburg",
    },
    attendees: [
      { email: input.attendeeEmail, displayName: input.attendeeName },
    ],
  };

  try {
    const created = await calendar.events.insert({
      calendarId: env.googleCalendarId,
      sendUpdates: "all",
      requestBody,
    });
    const eventId = created.data.id;
    if (!eventId) {
      throw new Error("Google Calendar returned no event id.");
    }
    return eventId;
  } catch (error) {
    // Service accounts cannot invite attendees without domain-wide delegation.
    // Retry once without attendees so the booking still lands on the calendar.
    const message = error instanceof Error ? error.message : "";
    if (!/forbidden|attendee/i.test(message)) throw error;

    const created = await calendar.events.insert({
      calendarId: env.googleCalendarId,
      requestBody: { ...requestBody, attendees: undefined },
    });
    const eventId = created.data.id;
    if (!eventId) {
      throw new Error("Google Calendar returned no event id.");
    }
    return eventId;
  }
}

/** Compensating action: if Neon insert fails after the calendar write, drop the event. */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!calendarConfigured) return;
  const calendar = calendarClient();
  await calendar.events.delete({
    calendarId: env.googleCalendarId,
    eventId,
  });
}
