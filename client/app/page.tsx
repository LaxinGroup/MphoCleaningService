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
        <BookingCoupon />
        <ContactStrip />
        <CtaBand />
      </div>
      <SiteFooter />
    </>
  );
}
