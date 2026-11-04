import type { Request, Response } from "express";
import { z } from "zod";
import { sendFail, sendOk } from "../lib/http.ts";
import { isIsoDate } from "../lib/sast.ts";
import { checkDayAvailability } from "../services/availability.ts";

const bodySchema = z.object({
  date: z.string().refine(isIsoDate, "date must be YYYY-MM-DD in SAST"),
});

export async function checkAvailability(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendFail(res, 400, parsed.error.issues[0]?.message ?? "Invalid request.");
    return;
  }

  const result = await checkDayAvailability(parsed.data.date);
  sendOk(res, result, result.capReached ? "Day is fully booked." : "Availability");
}
