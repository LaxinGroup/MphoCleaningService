const STAGES = [
  {
    verb: "Drop",
    copy: "Baskets come to 7375 Sibiya Street, Daveyton. Pickup is available at a fee.",
    src: "/images/laundry-basket.jpg",
    alt: "Folded summer clothes in a wicker laundry basket on a wooden table",
    width: 1024,
    height: 683,
  },
  {
    verb: "Book",
    copy: "Pick a SAST day. Three windows only. When the cap is hit, the day closes.",
    src: "/images/broom-ghana.jpg",
    alt: "Handmade grass brooms laid out for sale",
    width: 1920,
    height: 1440,
  },
  {
    verb: "Clean",
    copy: "Mupho does the work. You get the room, the linen, the glass, the yard.",
    src: "/images/window-cleaner.jpg",
    alt: "Window cleaner on a rope against a glass facade",
    width: 1920,
    height: 1079,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how">
      {STAGES.map((stage) => (
        <article
          key={stage.verb}
          className="relative h-[100svh] overflow-hidden bg-mupho-blue-slate"
        >
          <img
            src={stage.src}
            alt={stage.alt}
            width={stage.width}
            height={stage.height}
            loading="lazy"
            decoding="async"
            className="photo-drift cover absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-mupho-blue/25" />
          <h2 className="sticky top-[50%] z-10 -translate-y-1/2 text-center font-heading text-[24vw] font-black uppercase leading-none tracking-[-0.05em] text-white md:text-[clamp(96px,17vw,300px)]">
            {stage.verb}
          </h2>
          <p className="absolute bottom-6 left-[var(--margin)] right-[var(--margin)] max-w-[42ch] bg-mupho-blue/80 px-4 py-3 text-base leading-snug text-white md:right-auto">
            {stage.copy}
          </p>
        </article>
      ))}
    </section>
  );
}
