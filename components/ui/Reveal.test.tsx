import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The visitor's motion setting is the one thing that differs between the server's render (it cannot know it) and the
// browser's first render (it reads the real value). Both hooks a Reveal could read it from report it here.
const settings = { reduced: false, phone: false };
vi.mock("@/lib/useMediaQuery", () => ({
  useMediaQuery: (query: string) => (query.includes("reduced-motion") ? settings.reduced : settings.phone),
}));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => settings.reduced,
}));

import { Reveal } from "@/components/ui/Reveal";

const html = (props: { delay?: number; immediate?: boolean } = {}) =>
  renderToString(
    <Reveal {...props}>
      <p>Содржина</p>
    </Reveal>
  );

beforeEach(() => {
  settings.reduced = false;
  settings.phone = false;
});

describe("Reveal", () => {
  it("is readable in the server's markup: the plain content, nothing hidden or moved", () => {
    expect(html()).toBe('<div data-reveal="true"><p>Содржина</p></div>');
  });

  it("is readable on a phone and with a delay too", () => {
    settings.phone = true;
    expect(html({ delay: 0.2 })).toBe('<div data-reveal="true"><p>Содржина</p></div>');
  });

  it("renders the same markup whether or not the visitor asked for reduced motion (no hydration mismatch)", () => {
    const normal = html();
    settings.reduced = true;
    expect(html()).toBe(normal);
  });

  it("renders the same markup with reduced motion on a phone too", () => {
    settings.phone = true;
    const normal = html();
    settings.reduced = true;
    expect(html()).toBe(normal);
  });

  it("plays an immediate reveal in plain CSS, with no scroll reveal at all", () => {
    expect(html({ immediate: true, delay: 0.1 })).toBe(
      '<div class="enter" style="--enter-delay:0.1s"><p>Содржина</p></div>'
    );
  });
});
