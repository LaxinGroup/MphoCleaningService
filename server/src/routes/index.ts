import { Router } from "express";
import { checkAvailability } from "../controllers/availabilityController.ts";
import { createBooking } from "../controllers/bookingsController.ts";
import { getServices } from "../controllers/servicesController.ts";
import { sendFail, sendOk } from "../lib/http.ts";
import { testCalendarConnection } from "../services/calendar.ts";

export const api = Router();

api.get("/services", (req, res, next) => {
  void getServices(req, res).catch(next);
});

api.post("/check-availability", (req, res, next) => {
  void checkAvailability(req, res).catch(next);
});

api.post("/book", (req, res, next) => {
  void createBooking(req, res).catch(next);
});

// Diagnostic: confirms the service account can reach the booking calendar.
api.get("/calendar-test", (_req, res, next) => {
  void testCalendarConnection()
    .then((result) =>
      result.ok
        ? sendOk(res, result, "Calendar connected.")
        : sendFail(res, 502, `Calendar not reachable: ${result.error}`),
    )
    .catch(next);
});
