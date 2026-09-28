/**
 * Turns the combo photos into square, uncropped web images: non-square
 * photos are padded (not cropped) to a square in their own background
 * colour, and every image gets a small margin so jars clear the cards'
 * rounded corners. Output: public/images/products/combo-<name>.webp
 * Run: node scripts/prepare-combo-images.mjs
 */
import sharp from "sharp";

const dir = "public/images/products/";
const names = [
  "cheeni-gud",
  "chakli-gud",
  "chakli-cheeni",
  "namakpare-gud",
  "namakpare-cheeni",
  "namakpare-chakli",
  "namakpare-chakli-gud-cheeni",
];

const OUT = 1200;
const MARGIN = 0.06; // of the final side, each edge

for (const name of names) {
  const src = `${dir}${name}.png`;
  const img = sharp(src);
  const { width, height } = await img.metadata();

  // background colour = the top-left corner pixel
  const { data } = await sharp(src).extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  const bg = { r: data[0], g: data[1], b: data[2], alpha: 1 };

  // drop empty background around the jars first, so every combo's jars fill
  // the frame similarly (the wide photo had lots of side space)
  const trimmed = await sharp(src).flatten({ background: bg }).trim({ background: bg, threshold: 18 }).png().toBuffer();

  const inner = Math.round(OUT * (1 - 2 * MARGIN));
  const fitted = await sharp(trimmed)
    .resize(inner, inner, { fit: "contain", background: bg })
    .png()
    .toBuffer();

  const r = await sharp({ create: { width: OUT, height: OUT, channels: 3, background: bg } })
    .composite([{ input: fitted, gravity: "center" }])
    .webp({ quality: 84 })
    .toFile(`${dir}combo-${name}.webp`);
  console.log(`${name}: ${width}x${height} -> combo-${name}.webp ${OUT}x${OUT} (${Math.round(r.size / 1024)} KB, bg rgb(${bg.r},${bg.g},${bg.b}))`);
}
