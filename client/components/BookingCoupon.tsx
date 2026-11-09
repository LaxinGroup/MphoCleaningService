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
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const REASON_COPY: Record<AvailabilityResult["slots"][number]["reason"], string> = {
  open: "Open",
  daily_cap: "Day full",
  booked: "Taken",
  calendar_busy: "Busy",
  past: "Passed",
};

export function BookingCoupon({ initialDate }: { initialDate: string }) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [date, setDate] = useState(initialDate);
  const [today, setToday] = useState(initialDate);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [slotId, setSlotId] = useState<SlotId | "">("");
  const [serviceIds, setServiceIds] = useState<number[]>([]);
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
    fetchServices()
      .then((payload) => {
        setCategories(payload.categories);
        const first = payload.categories[0]?.services[0];
        if (first) setServiceIds([first.id]);
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
        setServiceIds([customEvent.detail.serviceId]);
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
    serviceIds.length > 0 &&
    Boolean(date) &&
    name.trim().length > 1 &&
    email.includes("@") &&
    phone.trim().length >= 10 &&
    status !== "saving";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || serviceIds.length === 0 || slotId === "" || !date) return;
    setStatus("saving");
    setMessage("");
    try {
      await createBooking({
        serviceIds,
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

  const selectedServices = services.filter((service) =>
    serviceIds.includes(service.id),
  );

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
              {selectedServices.length > 0 ? (
                <div className="bg-white/80 p-3 rounded-none border-l-4 border-mupho-blue">
                  <p className="text-xs uppercase tracking-wider font-heading font-bold text-mupho-blue/70">
                    Selected Services
                  </p>
                  <ul className="mt-1 space-y-1">
                    {selectedServices.map((service) => (
                      <li key={service.id} className="flex justify-between gap-3">
                        <span className="font-heading font-extrabold text-sm text-mupho-blue">
                          {service.name}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-mupho-blue">
                          {service.priceLabel}
                        </span>
                      </li>
                    ))}
                  </ul>
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
            <fieldset>
              <legend className="block text-xs font-heading font-bold uppercase tracking-wider mb-1">
                1. Select Service Packages
              </legend>
              <div className="max-h-56 w-full overflow-y-auto border border-mupho-blue/20 bg-white px-4 py-2 focus-within:ring-2 focus-within:ring-mupho-blue">
                {categories.map((category) => (
                  <div key={category.id} className="py-1">
                    <p className="font-heading text-xs font-bold uppercase text-mupho-blue/70">
                      {category.name}
                    </p>
                    {category.services.map((service) => (
                      <label
                        key={service.id}
                        htmlFor={`service-${service.id}`}
                        className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-mupho-blue"
                      >
                        <input
                          id={`service-${service.id}`}
                          type="checkbox"
                          checked={serviceIds.includes(service.id)}
                          onChange={(event) => {
                            setServiceIds((current) =>
                              event.target.checked
                                ? [...current, service.id]
                                : current.filter((id) => id !== service.id),
                            );
                          }}
                          className="size-4 accent-mupho-blue"
                        />
                        <span className="flex-1">{service.name}</span>
                        <span className="shrink-0 font-bold">{service.priceLabel}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-mupho-blue/80">
                Select one or more services ({serviceIds.length} selected).
              </p>
            </fieldset>

            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider mb-1" htmlFor="date">
                2. Choose SAST Date
              </label>
              <input
                id="date"
                type="date"
                required
                min={today}
                value={date}
                onFocus={() => setToday(todayIso())}
                onChange={(event) => {
                  setSlotId("");
                  setDate(event.target.value);
                }}
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
