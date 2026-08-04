import { SUPPORT_COPY } from "@/lib/support/copy";

export function SupportUsageCards() {
  return (
    <section className="space-y-5">
      <h2 className="text-[13px] font-medium uppercase tracking-[0.18em] text-white/45">
        {SUPPORT_COPY.usageHeading}
      </h2>

      <div className="space-y-3">
        {SUPPORT_COPY.usageCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[22px] border border-border/80 bg-subtle/60 px-5 py-5"
          >
            <h3 className="text-[17px] font-medium tracking-tight text-foreground">
              {card.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-white/55">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
