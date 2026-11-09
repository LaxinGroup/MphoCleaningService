import { Suspense } from "react";
import { io } from "next/cache";
import { BookingCoupon } from "@/components/BookingCoupon";
import { ContactStrip } from "@/components/ContactStrip";
import { CtaBand } from "@/components/CtaBand";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Intro } from "@/components/Intro";
import { LaundryStill } from "@/components/LaundryStill";
import { ServiceList } from "@/components/ServiceList";
import { SiteFooter } from "@/components/SiteFooter";
import { StreetPhoto } from "@/components/StreetPhoto";

async function BookingForm() {
  await io();
  const initialDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return <BookingCoupon initialDate={initialDate} />;
}

export default function Home() {
  return (
    <>
      <div className="relative z-10 bg-white">
        <Hero />
        <Intro />
        <StreetPhoto />
        <ServiceList />
        <HowItWorks />
        <LaundryStill />
        <Suspense fallback={null}>
          <BookingForm />
        </Suspense>
        <ContactStrip />
        <CtaBand />
      </div>
      <SiteFooter />
    </>
  );
}
