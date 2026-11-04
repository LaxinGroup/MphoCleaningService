import { Router } from "express";
import { checkAvailability } from "../controllers/availabilityController.ts";
import { createBooking } from "../controllers/bookingsController.ts";
import { getServices } from "../controllers/servicesController.ts";

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
