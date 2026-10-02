import { CountUp } from "@/components/ui/CountUp";

/** The company numbers in one framed row with thin dividers; each number counts up from 0 when it scrolls into view. */
export function StatsRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 border border-ink/12 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={[
            "px-6 py-8 sm:px-8 sm:py-10",
            // thin dividers between cells, whichever way the grid wraps
            i % 2 === 1 ? "border-l border-ink/12" : "",
            i >= 2 ? "border-t border-ink/12 lg:border-t-0" : "",
            i > 0 ? "lg:border-l lg:border-ink/12" : "",
          ].join(" ")}
        >
          {/* letterSpacing 0: .mono-stat's wide tracking suits small labels, not 44px numerals */}
          <div
            className="mono-stat text-[clamp(2rem,6vw,2.75rem)] leading-none text-gold-deep"
            style={{ letterSpacing: 0 }}
          >
            <CountUp value={stat.value} />
          </div>
          <div className="eyebrow mt-4 text-ink/60">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
