"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  checkAvailability,
  createBooking,
  fetchServices,
} from "@/lib/api";
import type {
  AvailabilityResult,
  ServiceCategory,
  SlotId,
} from "@/lib/types";

function todayIso(): string {
  const now = new Date();
  const sast = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return sast.toISOString().slice(0, 10);
}

const REASON_COPY: Record<AvailabilityResult["slots"][number]["reason"], string> = {
  open: "Open",
  daily_cap: "Day full",
  booked: "Taken",
  calendar_busy: "Busy",
  past: "Passed",
};

export function BookingCoupon() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [date, setDate] = useState("");
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [slotId, setSlotId] = useState<SlotId | "">("");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  const services = useMemo(
    () => categories.flatMap((category) => category.services),
    [categories],
  );

  useEffect(() => {
    setDate(todayIso());
  }, []);

  useEffect(() => {
    fetchServices()
      .then((payload) => {
        setCategories(payload.categories);
        const first = payload.categories[0]?.services[0];
        if (first) setServiceId(first.id);
      })
      .catch(() => {
        setMessage("Could not load services from the Express server.");
        setStatus("err");
      });
  }, []);

  // Listen for direct selection from ServiceList or external buttons
  useEffect(() => {
    function handleSelectService(event: Event) {
      const customEvent = event as CustomEvent<{ serviceId: number }>;
      if (customEvent.detail?.serviceId) {
        setServiceId(customEvent.detail.serviceId);
      }
    }
    window.addEventListener("mupho:select-service", handleSelectService);
    return () => {
      window.removeEventListener("mupho:select-service", handleSelectService);
    };
  }, []);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setSlotId("");
    checkAvailability(date)
      .then((result) => {
        if (!cancelled) setAvailability(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAvailability(null);
          setMessage(err instanceof Error ? err.message : "Availability failed.");
          setStatus("err");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const capReached = availability?.capReached ?? false;
  const canSubmit =
    !capReached &&
    Boolean(slotId) &&
    Boolean(serviceId) &&
    Boolean(date) &&
    name.trim().length > 1 &&
    email.includes("@") &&
    phone.trim().length >= 10 &&
    status !== "saving";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || typeof serviceId !== "number" || slotId === "" || !date) return;
    setStatus("saving");
    setMessage("");
    try {
      await createBooking({
        serviceId,
        date,
        slotId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setStatus("ok");
      setMessage("Booking confirmed! Mupho has saved your slot.");
      const refreshed = await checkAvailability(date);
      setAvailability(refreshed);
      setSlotId("");
    } catch (err: unknown) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Booking failed.");
    }
  }

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <section id="book" className="bg-[#eef3f8] py-[var(--section)]">
      <div className="wrap">
        <div
          data-ui
          className="relative mx-auto grid max-w-6xl overflow-hidden bg-mupho-yellow text-mupho-blue shadow-xl md:grid-cols-[0.9fr_1.1fr]"
        >
          {/* Perforated coupon visual divider */}
          <div
            className="hidden md:block absolute top-0 bottom-0 left-[45%] w-[5px] bg-[length:5px_16px] bg-repeat-y z-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, #eef3f8 2.5px, transparent 2.6px)",
            }}
            aria-hidden
          />

          {/* Left panel: Coupon stub */}
          <div className="flex min-h-[300px] flex-col justify-between p-8 md:p-12 border-b-2 border-dashed border-mupho-blue/20 md:border-b-0 md:border-r-2 md:border-dashed">
            <div>
              <span className="font-script text-2xl text-mupho-blue block mb-1">
                Let us do the dirty work!
              </span>
              <h2 className="font-heading text-[clamp(2rem,3.2vw,3rem)] font-black uppercase leading-[0.95] tracking-tight">
                Clip this slot
              </h2>
              <p className="mt-4 max-w-[30ch] text-base leading-relaxed font-body">
                Strict limit of <strong>3 bookings per day</strong> for our solo cleaner. Verified live against our diary and Google Calendar.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-mupho-blue/20 space-y-3">
              {selectedService ? (
                <div className="bg-white/80 p-3 rounded-none border-l-4 border-mupho-blue">
                  <p className="text-xs uppercase tracking-wider font-heading font-bold text-mupho-blue/70">
                    Selected Service
                  </p>
                  <p className="font-heading font-extrabold text-lg text-mupho-blue">
                    {selectedService.name}
                  </p>
                  <p className="text-sm font-bold text-mupho-blue">
                    {selectedService.priceLabel}
                  </p>
                </div>
              ) : null}

              <div className="text-xs text-mupho-blue/80 space-y-1">
                <p>📍 <strong>Drop-off:</strong> 7375 Sibiya Street, Daveyton</p>
                <p>💬 <strong>WhatsApp:</strong> 060 680 0678</p>
                <p>🚚 <em>Pickup available at a fee. No online card payments needed.</em></p>
              </div>
            </div>
          </div>

          {/* Right panel: Booking form */}
          <form className="flex flex-col gap-3 bg-mupho-yellow p-6 md:p-10" onSubmit={onSubmit}>
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider mb-1" htmlFor="service">
                1. Select Service Package
              </label>
              <select
                id="service"
                required
                value={serviceId}
                onChange={(event) => setServiceId(Number(event.target.value))}
                className="h-[52px] w-full bg-white px-4 text-base font-body border border-mupho-blue/20 focus:outline-none focus:ring-2 focus:ring-mupho-blue"
              >
                {categories.map((category) => (
                  <optgroup key={category.id} label={`${category.name} (${category.tagline})`}>
                    {category.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} — {service.priceLabel}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider mb-1" htmlFor="date">
                2. Choose SAST Date
              </label>
              <input
                id="date"
                type="date"
                required
                min={date || undefined}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-[52px] w-full bg-white px-4 text-base font-body border border-mupho-blue/20 focus:outline-none focus:ring-2 focus:ring-mupho-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider mb-1">
                3. Available Daily Window (Max 3)
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(availability?.slots ?? []).map((slot) => (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSlotId(slot.slotId)}
                    className={`h-[56px] px-3 py-2 text-left font-heading text-sm font-bold transition-all ${
                      slotId === slot.slotId
                        ? "bg-mupho-blue text-white ring-2 ring-mupho-blue shadow"
                        : slot.available
                          ? "bg-white hover:bg-white/90 text-mupho-blue border border-mupho-blue/20"
                          : "bg-white/40 text-mupho-blue/40 cursor-not-allowed border border-dashed border-mupho-blue/20"
                    }`}
                  >
                    <span className="block truncate">{slot.label}</span>
                    <span className="block font-body text-[11px] font-normal uppercase tracking-wider">
                      {REASON_COPY[slot.reason]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {capReached ? (
              <p className="bg-mupho-blue px-4 py-3 text-white text-sm font-bold">
                ⚠️ This day already has three bookings. Please select another date.
              </p>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="sr-only" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  required
                  placeholder="Your Name *"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-[50px] w-full bg-white px-4 text-base font-body border border-mupho-blue/20 focus:outline-none focus:ring-2 focus:ring-mupho-blue"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="phone">Phone / WhatsApp</label>
                <input
                  id="phone"
                  required
                  type="tel"
                  placeholder="Phone / WhatsApp *"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-[50px] w-full bg-white px-4 text-base font-body border border-mupho-blue/20 focus:outline-none focus:ring-2 focus:ring-mupho-blue"
                />
              </div>
            </div>

            <label className="sr-only" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="Email for Google Calendar invite *"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-[50px] w-full bg-white px-4 text-base font-body border border-mupho-blue/20 focus:outline-none focus:ring-2 focus:ring-mupho-blue"
            />

            <label className="sr-only" htmlFor="address">Service Address</label>
            <input
              id="address"
              placeholder="Address in Daveyton / Ekurhuleni (or blank for drop-off)"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="h-[50px] w-full bg-white px-4 text-base font-body border border-mupho-blue/20 focus:outline-none focus:ring-2 focus:ring-mupho-blue"
            />

            <label className="sr-only" htmlFor="notes">Special instructions</label>
            <input
              id="notes"
              placeholder="Special instructions or notes (optional)"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="h-[50px] w-full bg-white px-4 text-base font-body border border-mupho-blue/20 focus:outline-none focus:ring-2 focus:ring-mupho-blue"
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="cta-btn mt-2 h-14 w-full bg-mupho-blue text-white hover:bg-mupho-blue-slate active:scale-[0.99] font-heading font-black uppercase tracking-wider text-base transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "saving" ? "Reserving Slot…" : "Confirm Booking Slot"}
            </button>

            {message ? (
              <p
                className={`p-3 text-sm font-bold ${
                  status === "ok"
                    ? "bg-mupho-blue text-white"
                    : "bg-red-700 text-white"
                }`}
                role="status"
              >
                {message}
              </p>
            ) : null}

            <p className="text-[14px] text-mupho-blue/90 font-medium">
              {availability
                ? `📅 ${availability.remaining} of ${availability.dailyCap} slots available on ${availability.date}.`
                : "Checking availability…"}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
