"use client";

import { useEffect, useState } from "react";
import { ACCENT_CLASS } from "@/lib/accents";
import { fetchServices } from "@/lib/api";
import type { ServiceCategory } from "@/lib/types";

export function ServiceList() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  // All groups start closed; each one opens independently.
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  function toggleCategory(id: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    fetchServices()
      .then((payload) => setCategories(payload.categories))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load prices."),
      );
  }, []);

  function selectAndScrollToBooking(serviceId: number) {
    window.dispatchEvent(
      new CustomEvent("mupho:select-service", { detail: { serviceId } }),
    );
    const element = document.getElementById("book");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section id="prices" className="bg-mupho-blue py-(--section) text-white">
      <div className="wrap page-grid items-start gap-y-10">
        <div className="col-span-12 md:col-span-4 md:sticky md:top-6">
          <p className="font-script text-2xl md:text-3xl text-mupho-yellow">
            Our Services & Price List
          </p>
          <h2 className="mt-1 font-heading text-[clamp(2rem,4vw,3.5rem)] font-black uppercase leading-[0.95] tracking-tight">
            Transparent Local Rates
          </h2>
          <p className="mt-5 max-w-[32ch] text-lg leading-relaxed text-white/90">
            Every rate below is taken directly from our physical price list. Quality service, trusted & reliable.
          </p>

          <div className="mt-8 bg-mupho-blue-slate/60 border border-white/10 p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-heading font-bold text-sm uppercase text-mupho-yellow">Drop-off Address</p>
                <p className="text-sm text-white/90">7375 Sibiya Street, Daveyton</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-heading font-bold text-sm uppercase text-mupho-yellow">WhatsApp Contact</p>
                <a href="https://wa.me/27606800678" className="text-sm text-white/90 underline hover:text-mupho-yellow">
                  060 680 0678
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-xl">🚚</span>
              <div>
                <p className="font-heading font-bold text-sm uppercase text-mupho-yellow">Pickup & Delivery</p>
                <p className="text-sm text-white/90">Pickup available at a fee across Daveyton</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8">
          {error ? (
            <div className="bg-red-800 p-4 mb-6 text-white text-sm">
              <p className="font-bold">{error}</p>
              <p className="text-xs mt-1">Make sure Express is running via `node server.js` on port 4000.</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-4" data-ui>
            {categories.map((category) => {
              const isOpen = openIds.has(category.id);
              const panelId = `prices-${category.slug}`;
              return (
              <article key={category.id} className="overflow-hidden rounded-3xl border-2 border-white/70 shadow-lg">
                <h3>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className={`flex w-full items-center justify-between gap-4 px-6 py-5 md:px-8 md:py-6 text-left ${ACCENT_CLASS[category.accent]}`}
                  >
                    <span className="font-heading text-xl font-black uppercase tracking-tight md:text-2xl">
                      {category.name}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className={`size-6 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </h3>
                <ul id={panelId} hidden={!isOpen} className="divide-y divide-mupho-blue/10">
                  {category.services.map((service) => (
                    <li
                      key={service.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3.5 text-mupho-blue even:bg-[#eef3f8] transition-colors hover:bg-yellow-50/50"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-base font-bold">
                            {service.name}
                          </p>
                        </div>
                        <p className="text-sm text-mupho-blue/80 leading-snug mt-0.5">
                          {service.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <span className="font-heading text-base font-extrabold whitespace-nowrap text-mupho-blue">
                          {service.priceLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => selectAndScrollToBooking(service.id)}
                          className="bg-mupho-yellow hover:bg-mupho-yellow-bright text-mupho-blue font-heading font-bold text-xs uppercase px-3 py-1.5 transition-transform active:scale-95 shadow-sm"
                        >
                          Book Slot →
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
