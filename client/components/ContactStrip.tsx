const ROWS = [
  { href: "https://maps.google.com/?q=7375+Sibiya+Street+Daveyton", text: "7375 Sibiya Street" },
  { href: "https://maps.google.com/?q=Daveyton+Ekurhuleni", text: "Daveyton, Ekurhuleni" },
  { href: "https://wa.me/27606800678", text: "060 680 0678" },
  { href: "#book", text: "Pickup at a fee" },
] as const;

export function ContactStrip() {
  return (
    <section id="contact" className="bg-white">
      {ROWS.map((row, index) => {
        const className = `block px-[var(--margin)] py-10 font-heading text-[clamp(2.5rem,6vw,5.5rem)] font-black uppercase leading-none tracking-tight ${
          index % 2 === 0 ? "bg-mupho-blue text-white" : "bg-mupho-yellow-bright text-mupho-blue"
        }`;
        if (index === 0) {
          return (
            <h2 key={row.text} className={className}>
              <a href={row.href}>{row.text}</a>
            </h2>
          );
        }
        return (
          <a key={row.text} href={row.href} className={className}>
            {row.text}
          </a>
        );
      })}
    </section>
  );
}
