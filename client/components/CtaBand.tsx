export function CtaBand() {
  return (
    <section className="flex min-h-[90svh] flex-col justify-between bg-mupho-blue px-[var(--margin)] py-10 text-white">
      <h2 className="max-w-[12ch] font-heading text-[15vw] font-black uppercase leading-[0.9] tracking-[-0.04em] md:text-[9vw]">
        Do the dirty work
      </h2>
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <p className="max-w-[36ch] text-lg">
          WhatsApp the number on the flyer, or clip a window above. One cleaner.
          Three slots. Daveyton.
        </p>
        <a href="https://wa.me/27606800678" className="cta-btn w-full md:w-auto">
          WhatsApp Mupho
        </a>
      </div>
    </section>
  );
}
