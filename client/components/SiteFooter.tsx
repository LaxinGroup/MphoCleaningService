export function SiteFooter() {
  return (
    <footer className="sticky bottom-0 z-0 min-h-[100svh] bg-mupho-blue text-white">
      <div className="wrap grid grid-cols-2 gap-8 pt-10 md:grid-cols-4">
        <div>
          <p className="font-heading font-bold text-mupho-yellow uppercase text-xs tracking-wider mb-2">Drop-off Depot</p>
          <p className="opacity-90">7375 Sibiya Street</p>
          <p className="opacity-90">Daveyton, Ekurhuleni</p>
          <p className="text-xs text-mupho-yellow mt-1">Pickup available at a fee</p>
        </div>
        <div>
          <p className="font-heading font-bold text-mupho-yellow uppercase text-xs tracking-wider mb-2">Quick Navigation</p>
          <p className="hover:text-mupho-yellow transition-colors">
            <a href="#prices">Services & Prices</a>
          </p>
          <p className="hover:text-mupho-yellow transition-colors">
            <a href="#book">Book a Daily Slot</a>
          </p>
          <p className="hover:text-mupho-yellow transition-colors">
            <a href="#about">About Mupho</a>
          </p>
          <p className="hover:text-mupho-yellow transition-colors">
            <a href="#how">How It Works</a>
          </p>
        </div>
        <div>
          <p className="font-heading font-bold text-mupho-yellow uppercase text-xs tracking-wider mb-2">Direct Contact</p>
          <p>
            <a href="https://wa.me/27606800678" className="hover:text-mupho-yellow transition-colors underline font-bold">
              060 680 0678
            </a>
          </p>
          <p className="text-xs opacity-75 mt-1">WhatsApp & Call</p>
          <p className="text-xs opacity-75">Cash / Invoice / On delivery</p>
        </div>
        <div>
          <p className="font-heading font-bold text-mupho-yellow uppercase text-xs tracking-wider mb-2">Core Values</p>
          <p className="opacity-80">Affordability</p>
          <p className="opacity-80">Reliability</p>
          <p className="opacity-80">Care</p>
          <p className="opacity-80">Sustainability</p>
          <p className="opacity-80">Empowerment</p>
        </div>
      </div>
      <div className="flex min-h-[40svh] items-end px-[var(--margin)] pb-6 pt-[20svh]">
        <div className="w-full">
          <p className="font-heading text-[12vw] font-black uppercase leading-none tracking-[-0.06em] md:text-[10.4vw]">
            Mupho
          </p>
          <p className="mt-5 text-[13px] leading-relaxed opacity-80">
            Pictures of the trade, not of Mupho&apos;s jobs:{" "}
            <cite>Broom Peddler</cite> by Anne Claude Philippe de Tubières,
            1737, CC0, The Met; <cite>Local broom (Ghana)</cite> by Achiri
            Bitamsimli, CC BY-SA 4.0; <cite>Window Cleaner The Shard</cite> by
            It&apos;s No Game, CC BY 2.0; laundry basket by aqua.mech, CC BY
            2.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
