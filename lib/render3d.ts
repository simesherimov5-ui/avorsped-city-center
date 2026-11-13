import { existsSync } from "node:fs";
import path from "node:path";
import { render3dFor } from "@/data";

/**
 * The 3D render an apartment's plan viewer shows in its «3D» tab: the file mapped to it (data/renders.ts), only when that
 * file is in public/. Without one the viewer has no tabs. Server only (it reads the disk; on a static page, at build time).
 */
export function render3dShown(apartmentId: string): string | undefined {
  const src = render3dFor(apartmentId);
  return src && existsSync(path.join(process.cwd(), "public", src)) ? src : undefined;
}
