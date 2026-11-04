export function SiteNav() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4 pt-5 sm:px-6 md:px-10">
      <p className="pointer-events-auto font-heading text-[15px] font-extrabold tracking-tight text-mupho-yellow">
        MTC
      </p>
      <nav className="pointer-events-auto flex items-center gap-5 font-heading text-[15px] font-semibold text-white">
        <a href="#prices" className="hidden sm:inline">
          Prices
        </a>
        <a href="#how" className="hidden md:inline">
          How
        </a>
        <a href="#book" className="underline decoration-mupho-yellow decoration-2 underline-offset-4">
          Book
        </a>
      </nav>
    </header>
  );
}
