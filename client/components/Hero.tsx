
export function Hero() {
  return (
    <section className="relative min-h-[100svh] bg-mupho-blue text-white flex flex-col justify-between">
      

      {/* Main Title Banner */}
      <div className="relative pt-[22vh] md:pt-[18vh] px-[var(--margin)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-script text-2xl md:text-3xl text-mupho-yellow">
            Clean Spaces, Happy Lives
          </span>
          <span className="hidden sm:inline-block w-8 h-[2px] bg-mupho-yellow/60"></span>
        </div>

        <h1 className="max-w-[92vw] font-heading text-[18vw] sm:text-[16vw] md:text-[clamp(90px,14vw,200px)] font-black uppercase leading-[0.82] tracking-[-0.05em]">
          <span className="mask-line text-mupho-yellow">
            <span>Mupho</span>
          </span>
          <span className="mask-line delay text-white">
            <span>The Cleaner</span>
          </span>
        </h1>

        <p className="mt-6 max-w-[42ch] font-body text-base md:text-xl leading-relaxed text-white/90">
          Reliable, thorough and affordable cleaning solution for all your cleaning needs in Daveyton. 
          Solo operation with a strict cap of <strong>three bookings per day</strong>.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href="#book"
            className="cta-btn inline-flex items-center gap-2 bg-mupho-yellow text-mupho-blue hover:bg-mupho-yellow-bright font-heading font-black uppercase tracking-wider text-sm px-6 py-3 transition-transform active:scale-95"
          >
            Book a Daily Slot →
          </a>
          <a
            href="#prices"
            className="inline-flex items-center gap-2 border-2 border-white/80 hover:border-mupho-yellow hover:text-mupho-yellow text-white font-heading font-bold text-sm px-5 py-3 transition-colors uppercase tracking-wider"
          >
            View Flyer Price List
          </a>
        </div>
      </div>

      {/* Bottom Core Values Strip */}
      <div className="border-t border-white/10 bg-mupho-blue-slate/70 px-[var(--margin)] py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs md:text-sm font-heading font-bold tracking-wider text-mupho-yellow uppercase">
          <span>Affordability</span>
          <span className="text-white/40">•</span>
          <span>Reliability</span>
          <span className="text-white/40">•</span>
          <span>Care</span>
          <span className="text-white/40">•</span>
          <span>Sustainability</span>
          <span className="text-white/40">•</span>
          <span>Empowerment</span>
        </div>
      </div>
    </section>
  );
}
