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

/**
 * Extracts a human-readable error message from a googleapis response error.
 * Google wraps their errors in error.errors[0].message or error.message.
 */
function googleErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);
  const e = error as Record<string, unknown>;
  const errors = e["errors"];
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as Record<string, unknown>;
    if (typeof first["message"] === "string") return first["message"];
  }
  if (typeof e["message"] === "string") return e["message"];
  return JSON.stringify(error);
}

/**
 * Returns true ONLY when the error is specifically about attendee invitations,
 * NOT when the error is a calendar permission / access / auth error.
 * This prevents the retry loop from masking real setup problems.
 */
function isAttendeeOnlyError(error: unknown): boolean {
  const msg = googleErrorMessage(error).toLowerCase();
  return (
    msg.includes("attendee") &&
    !msg.includes("not found") &&
    !msg.includes("not_found") &&
    !msg.includes("does not exist")
  );
}

export async function isSlotBusyOnCalendar(
  start: Date,
  end: Date,
): Promise<boolean> {
  if (!calendarConfigured) {
    return false;
  }

  try {
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
  } catch (error) {
    // Log but don't block availability checks if the calendar is unreachable
    console.error("[mupho:calendar] freebusy check failed:", googleErrorMessage(error));
    return false;
  }
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
  const calId = env.googleCalendarId;

  console.log(
    `[mupho:calendar] Writing event to calendar "${calId}" ` +
    `for customer "${input.attendeeEmail}"`,
  );

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
    // First attempt: with customer as an attendee (they receive a calendar invite)
    const created = await calendar.events.insert({
      calendarId: calId,
      sendUpdates: "all",
      requestBody,
    });
    const eventId = created.data.id;
    if (!eventId) throw new Error("Google Calendar returned no event id.");
    console.log(`[mupho:calendar] Event created successfully: ${eventId}`);
    return eventId;

  } catch (firstError) {
    const msg = googleErrorMessage(firstError);
    console.warn(`[mupho:calendar] First insert attempt failed: ${msg}`);

    // Only retry without attendees for the specific attendee-invite restriction.
    // For ANY other error (wrong calendar, no permission, bad auth) we surface
    // the real error immediately so it is visible in Render logs.
    if (!isAttendeeOnlyError(firstError)) {
      console.error(
        `[mupho:calendar] Cannot write to calendar "${calId}". ` +
        `Ensure this calendar is shared with the service account ` +
        `"${env.googleClientEmail}" with "Make changes to events" permission. ` +
        `Error: ${msg}`,
      );
      throw new Error(`Google Calendar error: ${msg}`);
    }

    // Retry without attendees — event still lands on Mupho's own calendar
    console.log(
      "[mupho:calendar] Attendee restriction detected. " +
      "Retrying without attendee invite…",
    );
    const created = await calendar.events.insert({
      calendarId: calId,
      requestBody: { ...requestBody, attendees: undefined },
    });
    const eventId = created.data.id;
    if (!eventId) throw new Error("Google Calendar returned no event id on retry.");
    console.log(`[mupho:calendar] Event created without attendee invite: ${eventId}`);
    return eventId;
  }
}

/** Compensating action: if Neon insert fails after the calendar write, drop the event. */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!calendarConfigured) return;
  try {
    const calendar = calendarClient();
    await calendar.events.delete({
      calendarId: env.googleCalendarId,
      eventId,
    });
    console.log(`[mupho:calendar] Rolled back calendar event: ${eventId}`);
  } catch (error) {
    console.error(
      `[mupho:calendar] Rollback failed for event ${eventId}:`,
      googleErrorMessage(error),
    );
  }
}

/**
 * Diagnostic: verifies the service account can read/access the target calendar.
 * Hit GET /api/calendar-test to check your setup without making a real booking.
 */
export async function testCalendarConnection(): Promise<{
  ok: boolean;
  calendarId: string;
  calendarName?: string;
  serviceAccount?: string;
  error?: string;
}> {
  const calId = env.googleCalendarId;
  const serviceAccount = env.googleClientEmail;
  try {
    const calendar = calendarClient();
    const cal = await calendar.calendars.get({ calendarId: calId });
    return {
      ok: true,
      calendarId: calId,
      calendarName: cal.data.summary ?? "(no name)",
      serviceAccount,
    };
  } catch (error) {
    return {
      ok: false,
      calendarId: calId,
      serviceAccount,
      error: googleErrorMessage(error),
    };
  }
}
