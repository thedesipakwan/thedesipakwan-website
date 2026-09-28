/**
 * Builds web assets from public/images/logo.png (transparent):
 *  - logo-trim.webp   trimmed wordmark, 800px wide, for navbar/footer
 *  - logo-mark.png    256px square wordmark on cream (Razorpay checkout, JSON-LD)
 *  - app/icon.png     512px square favicon: the illustration only, legible when tiny
 * Run: node scripts/prepare-logo.mjs
 */
import sharp from "sharp";

const CREAM = { r: 255, g: 243, b: 220, alpha: 1 };
const src = "public/images/logo.png";

const trimmed = await sharp(src).trim({ threshold: 10 }).png().toBuffer();
await sharp(trimmed).resize({ width: 800 }).webp({ quality: 88 }).toFile("public/images/logo-trim.webp");
// PNG for emails (Outlook and older Gmail apps don't show WebP); 2× of the 200px display width
await sharp(trimmed).resize({ width: 400 }).png({ compressionLevel: 9 }).toFile("public/images/email-logo.png");

async function onCream(input, size, pad) {
  const inner = await sharp(input)
    .resize(size - pad * 2, size - pad * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: CREAM } })
    .composite([{ input: inner, gravity: "center" }])
    .png();
}

await (await onCream(trimmed, 256, 14)).toFile("public/images/logo-mark.png");

// the woman + thekua medallion, cropped from the original 1254px artwork
const figure = await sharp(src).extract({ left: 530, top: 350, width: 270, height: 270 }).png().toBuffer();
await (await onCream(figure, 512, 24)).toFile("app/icon.png");
console.log("done");
