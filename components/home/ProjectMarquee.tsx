import "./home.css";

/**
 * The portfolio's names in large Playfair italic, running slowly past under the hero. Decorative: the projects are
 * listed in full in the next section, so a screen reader skips it. With reduced motion it stands still.
 */
export function ProjectMarquee({ names }: { names: string[] }) {
  // One group holds every name twice, so it is always wider than the screen; the track holds two identical groups
  // and slides half its width, which loops without a jump.
  const group = [...names, ...names];
  return (
    <section aria-hidden className="pm">
      <div className="pm-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="pm-group">
            {group.map((name, i) => (
              <span key={`${name}-${i}`} className="pm-pair">
                <span className="pm-name">{name}</span>
                <span className="pm-dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
