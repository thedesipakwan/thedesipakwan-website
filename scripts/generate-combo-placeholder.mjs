/**
 * Shared placeholder for combo products until real photos exist.
 * Run: node scripts/generate-combo-placeholder.mjs
 */
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="#F4F8EA"/>
  <g fill="none" stroke="#1B4A35" stroke-width="10" opacity="0.85">
    <rect x="250" y="330" width="220" height="290" rx="34"/>
    <rect x="530" y="330" width="220" height="290" rx="34"/>
    <rect x="232" y="300" width="256" height="54" rx="20" fill="#0C2B1E" stroke="none"/>
    <rect x="512" y="300" width="256" height="54" rx="20" fill="#0C2B1E" stroke="none"/>
  </g>
  <rect x="270" y="440" width="180" height="90" rx="12" fill="#FF8A3C" opacity="0.9"/>
  <rect x="550" y="440" width="180" height="90" rx="12" fill="#FF8A3C" opacity="0.9"/>
  <text x="500" y="505" text-anchor="middle" font-family="Georgia, serif" font-size="96" font-weight="900" fill="#B03A0F">+</text>
  <text x="500" y="740" text-anchor="middle" font-family="Georgia, serif" font-size="58" font-weight="900" fill="#0C2B1E">Combo</text>
  <text x="500" y="800" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#1B4A35" opacity="0.7">Photo coming soon</text>
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile("public/images/products/combo-placeholder.webp");
console.log("created public/images/products/combo-placeholder.webp");
