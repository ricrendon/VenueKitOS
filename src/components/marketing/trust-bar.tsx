export function TrustBar() {
  const venueTypes = [
    "Indoor Playgrounds",
    "Family Entertainment Centers",
    "Trampoline Parks",
    "Ninja Gyms",
    "Bounce Houses",
    "Play Cafes",
    "Soft Play Centers",
  ];

  return (
    <section className="bg-[#F0EBE4] border-y border-cream-300">
      <div className="container-wide py-7">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
          <p className="text-caption font-semibold text-ink/40 uppercase tracking-widest shrink-0">
            Built for
          </p>
          <div className="flex-1 flex flex-wrap items-center gap-3">
            {venueTypes.map((type, i) => (
              <span
                key={type}
                className="flex items-center gap-2.5 text-body-s text-ink/60 font-medium"
              >
                {i > 0 && <span className="w-1 h-1 rounded-full bg-ink/20" />}
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
