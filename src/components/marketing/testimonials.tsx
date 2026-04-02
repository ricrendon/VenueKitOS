import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "We were drowning in spreadsheets, paper waivers, and missed bookings. VenueKit OS replaced five different tools in one week. Check-in alone saves us 20 minutes every morning.",
    name: "Marcus T.",
    title: "Owner, Bounce Kingdom",
    location: "Austin, TX",
    stars: 5,
    initials: "MT",
    color: "bg-terracotta/15 text-terracotta",
  },
  {
    quote:
      "The party management module is unreal. We run 12 birthday parties a weekend and every single one now goes off without a hitch. The timeline view keeps our hosts on track all day.",
    name: "Stephanie R.",
    title: "Operations Manager, Jungle Jump FEC",
    location: "Denver, CO",
    stars: 5,
    initials: "SR",
    color: "bg-dusty-blue/15 text-dusty-blue",
  },
  {
    quote:
      "The hardware setup took literally 25 minutes. Tablet was pre-loaded, POS connected to my wifi, and we were checking in guests before lunch. I've never had a software rollout go that smoothly.",
    name: "David K.",
    title: "Founder, Ninja Zone",
    location: "Nashville, TN",
    stars: 5,
    initials: "DK",
    color: "bg-sage/15 text-sage",
  },
];

export function Testimonials() {
  return (
    <section className="bg-ink section-padding-lg">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-caption font-semibold text-terracotta uppercase tracking-widest mb-3">
            From operators
          </p>
          <h2 className="font-display text-h2 text-white mb-4">
            Built for real venues. Loved by real operators.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/5 border border-white/8 rounded-xl p-7 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} fill="#C96E4B" className="text-terracotta" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-body-m text-white/70 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/8">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-label ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-body-s font-semibold text-white">{t.name}</p>
                  <p className="text-caption text-white/40">{t.title}</p>
                  <p className="text-caption text-white/30">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
