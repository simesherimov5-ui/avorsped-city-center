/** The small map pin that marks a place to choose (the path is the one on the board's «Мапа» button). */
export function PinIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`pj-pinicon${filled ? " is-filled" : ""}`}>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2" className="pj-pinhole" />
    </svg>
  );
}
