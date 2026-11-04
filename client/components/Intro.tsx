export function Intro() {
  return (
    <section id="about" className="bg-white py-[var(--section)]">
      <div className="wrap page-grid items-center gap-y-10">
        <div className="col-span-12 md:col-span-5">
          <span className="font-script text-2xl text-mupho-blue block mb-2">
            Let us do the dirty work!
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-black uppercase leading-[0.95] tracking-tight text-mupho-blue">
            Three jobs. One day. Solo care.
          </h2>
          <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-mupho-blue/90">
            Mupho works alone to ensure direct quality control. The diary holds exactly three windows per day:
            <strong> Morning, Midday, and Afternoon</strong>. When a day fills, bookings lock automatically.
          </p>

          <blockquote className="mt-6 border-l-4 border-mupho-yellow pl-4 italic text-base text-mupho-blue/80">
            &ldquo;We see beauty in the mess, trust us to clean the mess while you enjoy the beauty of sparkles in your space.&rdquo;
          </blockquote>

          {/* Trust Badges matching the physical flyer */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-mupho-blue/10 pt-6 text-center">
            <div className="bg-[#eef3f8] p-3">
              <span className="text-xl">✨</span>
              <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-mupho-blue mt-1">
                Quality Service
              </p>
            </div>
            <div className="bg-[#eef3f8] p-3">
              <span className="text-xl">🤝</span>
              <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-mupho-blue mt-1">
                Trusted & Reliable
              </p>
            </div>
            <div className="bg-[#eef3f8] p-3">
              <span className="text-xl">💛</span>
              <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-mupho-blue mt-1">
                Your Priority
              </p>
            </div>
          </div>
        </div>

        <figure className="col-span-12 md:col-span-6 md:col-start-7 shadow-lg border border-mupho-blue/10">
          <img
            src="/images/broom-peddler.jpg"
            alt="Historical etching of a broom peddler carrying tools of the craft"
            width={2832}
            height={3655}
            className="h-auto w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
