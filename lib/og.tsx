import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// (next/og draws with Satori: absolutely placed boxes need explicit top / left / right / bottom, not `inset`.)
// The social share image (1200 × 630): a darkened photo of the project, a gold rule, and the name in Playfair Display.
// Colours are the site's three (paper, ink, gold), written as rgb() because an image has no CSS variables.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

const PAPER = "rgb(250, 248, 245)";
const INK = "rgb(20, 20, 20)";
const GOLD = "rgb(201, 164, 92)";

type OgOptions = {
  /** Small label above the title, e.g. "Јавор Шпед · Exclusive Building". */
  label: string;
  title: string;
  subtitle?: string;
  /** A photo from /public, e.g. "/images/exteriors/exterior-hero-wide.jpg". */
  photo?: string;
};

export async function renderOg({ label, title, subtitle, photo }: OgOptions) {
  // The font file holds the Latin and Macedonian Cyrillic letters (next/og's default font has no Cyrillic).
  const font = await readFile(join(process.cwd(), "assets/fonts/PlayfairDisplay-Regular.woff"));
  const picture = photo
    ? `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public", photo))).toString("base64")}`
    : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: INK,
        color: PAPER,
        fontFamily: "Playfair",
      }}
    >
      {picture && (
        // eslint-disable-next-line @next/next/no-img-element -- next/og renders this tag; it is not a page image
        <img
          src={picture}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "linear-gradient(to top, rgba(20,20,20,0.94) 0%, rgba(20,20,20,0.72) 45%, rgba(20,20,20,0.3) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          right: 28,
          bottom: 28,
          border: "1px solid rgba(201,164,92,0.45)",
          display: "flex",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72, width: "100%" }}>
        <div style={{ width: 72, height: 2, backgroundColor: GOLD, marginBottom: 28 }} />
        <div style={{ fontSize: 22, letterSpacing: 6, color: GOLD, marginBottom: 22, display: "flex" }}>
          {label.toUpperCase()}
        </div>
        <div style={{ fontSize: 78, lineHeight: 1.08, display: "flex" }}>{title}</div>
        {subtitle && (
          <div
            style={{ fontSize: 32, lineHeight: 1.3, marginTop: 20, color: "rgba(250,248,245,0.78)", display: "flex" }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>,
    { ...OG_SIZE, fonts: [{ name: "Playfair", data: font, weight: 400, style: "normal" }] }
  );
}
