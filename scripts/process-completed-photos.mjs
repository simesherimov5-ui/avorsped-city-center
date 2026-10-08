// Crops and grades the originals of the completed projects' photos (run: node scripts/process-completed-photos.mjs).
// It reads reference/photos-originals/gtc-global/ and writes public/images/gtc-global/global-01.jpg … global-05.jpg.
// Crop first (in pixels of the original), then resize: never larger than the cropped size, at most 2400px wide.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const from = "reference/photos-originals/gtc-global";
const to = "public/images/gtc-global";

// left/top/width/height are in the original's pixels.
const PHOTOS = [
  // A: 3:2, the man in the white shirt on the left is cut off; the whole GLOBAL sign and the glass facade stay
  { src: "A.jpg", out: "global-01.jpg", crop: { left: 540, top: 0, width: 3330, height: 2220 } },
  // B: 4:5 portrait, the building centred, the sign fully inside
  { src: "B.jpg", out: "global-02.jpg", crop: { left: 0, top: 20, width: 1200, height: 1500 } },
  // C: 16:9, the building stays in the left third; the bright box at the bottom is out
  { src: "C.jpg", out: "global-03.jpg", crop: { left: 0, top: 0, width: 4272, height: 2403 } },
  // D: 3:2, the dark railing at the bottom is out
  { src: "D.jpg", out: "global-04.jpg", crop: { left: 0, top: 0, width: 1000, height: 667 } },
  // E: no crop
  { src: "E.jpg", out: "global-05.jpg", crop: null },
];

await mkdir(to, { recursive: true });

for (const { src, out, crop } of PHOTOS) {
  let image = sharp(`${from}/${src}`).rotate(); // apply the camera orientation
  if (crop) image = image.extract(crop);
  const cropped = crop ? crop.width : (await sharp(`${from}/${src}`).rotate().metadata()).width;
  const info = await image
    .resize({ width: Math.min(2400, cropped), withoutEnlargement: true })
    // the same grade on all five, so they read as one set
    .modulate({ saturation: 0.9, brightness: 1.02 })
    .linear(1.06, -8)
    .sharpen({ sigma: 0.8 })
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(`${to}/${out}`);
  console.log(out, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}
