/**
 * Placeholder founder portrait (4:5). Skips if a real photo already exists.
 * Run: node scripts/generate-founder-placeholder.mjs
 */
import { existsSync } from "node:fs";
import sharp from "sharp";

const out = "public/images/founder.webp";
if (existsSync(out)) {
  console.log("skip (exists)", out);
  process.exit(0);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#1B4A35"/>
      <stop offset="100%" stop-color="#0C2B1E"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#g)"/>
  <!-- simple portrait silhouette -->
  <circle cx="600" cy="560" r="190" fill="#E9B949" opacity="0.9"/>
  <path d="M250 1260 C250 980 420 860 600 860 C780 860 950 980 950 1260 Z" fill="#E9B949" opacity="0.9"/>
  <text x="600" y="1370" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#FF8A3C">Founder photo</text>
  <text x="600" y="1425" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#F4F8EA" opacity="0.7">Replace public/images/founder.webp</text>
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(out);
console.log("created", out);
