/**
 * Generates brand-coloured placeholder assets with the exact filenames the
 * site expects, so real photography can be dropped in without code changes.
 * Skips any file that already exists (drop in a real file and re-run safely).
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public", "images");

// Brand palette — "Paan, Kesariya, Pista, Mehndi, Sindoor"
const C = {
  paan900: "#0C2B1E",
  paan700: "#1B4A35",
  kesariya500: "#FF8A3C",
  kesariya300: "#FFB884",
  pista100: "#F4F8EA",
  pista200: "#E3EDD2",
  mehndi600: "#2E7D57",
  sindoor600: "#B03A0F",
  // Food illustration colours — food stays golden regardless of brand theme
  wheat: "#E9B949",
  wheatMid: "#DDA435",
  wheatLight: "#F7D98B",
  earth: "#7A4A21",
};

// Keep in sync with data/products.ts (placeholder-only; real photos replace these).
const products = [
  { slug: "gud-thekua", name: "Gud Thekua", family: "thekua" },
  { slug: "cheeni-thekua", name: "Cheeni Thekua", family: "thekua" },
  { slug: "nariyal-thekua", name: "Nariyal Gud Thekua", family: "thekua" },
  { slug: "dry-fruit-thekua", name: "Dry Fruit Thekua", family: "thekua" },
  { slug: "butter-chakli", name: "Butter Chakli", family: "chakli" },
  { slug: "masala-chakli", name: "Masala Chakli", family: "chakli" },
  { slug: "lahsun-chakli", name: "Lahsun Chakli", family: "chakli" },
  { slug: "ragi-chakli", name: "Ragi Chakli", family: "chakli" },
  { slug: "chai-time-combo", name: "Chai Time Combo", family: "combo" },
  { slug: "festive-gift-box", name: "Festive Gift Box", family: "combo" },
];

/* ---------- shared SVG fragments ---------- */

function mouldStamp(cx, cy, r, color, strokeW = r * 0.055) {
  const petals = Array.from({ length: 8 })
    .map(
      (_, i) =>
        `<ellipse cx="${cx}" cy="${cy - r * 0.45}" rx="${r * 0.13}" ry="${r * 0.3}" fill="none" stroke="${color}" stroke-width="${strokeW}" transform="rotate(${i * 45} ${cx} ${cy})"/>`
    )
    .join("");
  const dots = Array.from({ length: 12 })
    .map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return `<circle cx="${(cx + r * 0.78 * Math.cos(a)).toFixed(1)}" cy="${(cy + r * 0.78 * Math.sin(a)).toFixed(1)}" r="${r * 0.06}" fill="${color}"/>`;
    })
    .join("");
  return `
    <circle cx="${cx}" cy="${cy}" r="${r * 0.92}" fill="none" stroke="${color}" stroke-width="${strokeW}"/>
    ${dots}${petals}
    <rect x="${cx - r * 0.14}" y="${cy - r * 0.14}" width="${r * 0.28}" height="${r * 0.28}" fill="none" stroke="${color}" stroke-width="${strokeW}" transform="rotate(45 ${cx} ${cy})"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.05}" fill="${color}"/>`;
}

function chakliSpiralPath(cx, cy, scale = 1) {
  let d = `M ${cx} ${cy}`;
  for (let t = 0.18; t <= 3.25 * Math.PI * 2; t += 0.18) {
    const r = (6.2 * (t / (Math.PI * 2)) * 2 + 1.5) * scale;
    d += ` L ${(cx + r * Math.cos(t)).toFixed(2)} ${(cy + r * Math.sin(t)).toFixed(2)}`;
  }
  return d;
}

/* ---------- writers ---------- */

async function ensureDir(p) {
  await mkdir(path.dirname(p), { recursive: true });
}

async function writeIfMissing(file, fn) {
  if (existsSync(file)) {
    console.log("skip (exists)", path.relative(ROOT, file));
    return;
  }
  await ensureDir(file);
  await fn(file);
  console.log("created      ", path.relative(ROOT, file));
}

const svgBuffer = (svg) => Buffer.from(svg);

/* ---------- 1. standalone SVG motifs ---------- */

const mouldPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
${mouldStamp(55, 55, 42, C.kesariya500)}
${mouldStamp(165, 165, 42, C.kesariya500)}
${mouldStamp(165, 55, 26, C.kesariya500)}
${mouldStamp(55, 165, 26, C.kesariya500)}
</svg>`;

const chakliSpiralSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
<path d="${chakliSpiralPath(50, 50)}" stroke="${C.kesariya500}" stroke-width="5" stroke-linecap="round"/>
</svg>`;

const chaiCupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" fill="none">
<path d="M78 78 C70 62, 88 56, 80 40 C74 28, 86 22, 82 10" stroke="${C.kesariya500}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
<path d="M100 74 C92 58, 110 52, 102 36 C96 24, 108 18, 104 6" stroke="${C.kesariya500}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
<path d="M122 78 C114 62, 132 56, 124 40 C118 28, 130 22, 126 10" stroke="${C.kesariya500}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
<path d="M52 96 H148 C148 96 146 152 128 168 C118 177 82 177 72 168 C54 152 52 96 52 96 Z" fill="${C.pista200}" stroke="${C.paan900}" stroke-width="5"/>
<path d="M58 108 C80 116 120 116 142 108" stroke="${C.paan700}" stroke-width="4" stroke-linecap="round"/>
<path d="M148 108 C170 108 172 140 148 146" stroke="${C.paan900}" stroke-width="5" fill="none"/>
<ellipse cx="100" cy="192" rx="66" ry="12" fill="${C.pista200}" stroke="${C.paan900}" stroke-width="5"/>
</svg>`;

/* ---------- 2. trust icons ---------- */

const iconStroke = `fill="none" stroke="${C.pista100}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
  "desi-ghee": `<path d="M24 6 C24 6 18 14 18 18 a6 6 0 0 0 12 0 C30 14 24 6 24 6 Z" ${iconStroke}/><path d="M10 30 h28 c0 6 -5 12 -14 12 s-14 -6 -14 -12 Z" ${iconStroke}/>`,
  "no-preservatives": `<path d="M38 10 C20 10 10 22 10 38 C26 38 38 28 38 10 Z" ${iconStroke}/><path d="M14 34 C20 26 28 20 34 14" ${iconStroke}/>`,
  handmade: `<path d="M16 26 V12 a3 3 0 0 1 6 0 v10 M22 22 V8 a3 3 0 0 1 6 0 v14 M28 22 V11 a3 3 0 0 1 6 0 v15" ${iconStroke}/><path d="M34 26 l4 -5 a3 3 0 0 1 5 4 l-8 11 c-3 4 -7 6 -12 6 c-7 0 -12 -5 -12 -12 v-8 a3 3 0 0 1 6 0" ${iconStroke}/>`,
  "fresh-after-order": `<circle cx="22" cy="26" r="14" ${iconStroke}/><path d="M22 18 v8 l6 4" ${iconStroke}/><path d="M38 8 l1.5 4 L44 13.5 l-4.5 1.5 L38 19 l-1.5 -4 L32 13.5 l4.5 -1.5 Z" ${iconStroke}/>`,
  fssai: `<path d="M24 4 L40 10 V22 C40 33 33 40 24 44 C15 40 8 33 8 22 V10 Z" ${iconStroke}/><path d="M16 24 l6 6 l10 -12" ${iconStroke}/>`,
  "breakage-safe": `<path d="M8 16 L24 8 L40 16 V34 L24 42 L8 34 Z" ${iconStroke}/><path d="M8 16 L24 24 L40 16 M24 24 V42" ${iconStroke}/><path d="M15 12.5 L31 20.5" ${iconStroke}/>`,
};

/* ---------- 3. hero stack (transparent png) ---------- */

function thekuaShape(cx, cy, rx, ry, fill, stampColor) {
  return `
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${C.earth}" stroke-width="6"/>
  <g transform="translate(${cx} ${cy}) scale(1 ${ry / rx}) translate(${-cx} ${-cy})">
    ${mouldStamp(cx, cy, rx * 0.72, stampColor, 4)}
  </g>`;
}

const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <!-- leaning chakli -->
  <g transform="rotate(-18 640 430) translate(640 430)">
    <circle r="150" fill="${C.wheatLight}"/>
    <path d="${chakliSpiralPath(0, 0, 3.4)}" stroke="${C.earth}" stroke-width="26" stroke-linecap="round" fill="none"/>
  </g>
  <!-- stacked thekua -->
  ${thekuaShape(430, 640, 250, 105, C.wheat, C.earth)}
  ${thekuaShape(430, 520, 235, 100, C.wheatMid, C.earth)}
  ${thekuaShape(430, 400, 220, 95, C.wheatLight, C.earth)}
</svg>`;

/* ---------- 4. product placeholder cards ---------- */

function productSvg(name, family, variant) {
  const familyColor = family === "chakli" ? C.mehndi600 : family === "combo" ? C.sindoor600 : C.kesariya500;
  const motif =
    family === "chakli"
      ? `<path d="${chakliSpiralPath(500, 430, 6.5)}" stroke="${C.earth}" stroke-width="34" stroke-linecap="round" fill="none"/>`
      : `<g>${thekuaShape(500, 430, 240, 150, variant === 2 ? C.wheatLight : C.wheat, C.earth)}</g>`;
  const zoom = variant === 2 ? `transform="translate(-250 -220) scale(1.5)"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="${C.pista100}"/>
  <rect width="1000" height="14" fill="${familyColor}"/>
  <g ${zoom}>${motif}</g>
  <text x="500" y="790" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="700" fill="${C.paan900}">${name}</text>
  <text x="500" y="850" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="${C.paan700}">${variant === 1 ? "Pack shot placeholder" : "Texture close-up placeholder"}</text>
</svg>`;
}

/* ---------- 5. sequence frames ---------- */

function frameSvg(i, total) {
  const t = i / (total - 1);
  // colour shifts cream -> golden as it "fries"
  const mix = (a, b) => Math.round(a + (b - a) * t);
  const from = [0xff, 0xf3, 0xdc]; // raw dough cream
  const to = [0xdd, 0xa4, 0x35]; // fried golden (wheatMid)
  const fill = `rgb(${mix(from[0], to[0])},${mix(from[1], to[1])},${mix(from[2], to[2])})`;
  const angle = t * 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <rect width="480" height="480" fill="${C.paan900}"/>
  <circle cx="240" cy="240" r="190" fill="${fill}"/>
  <g transform="rotate(${angle.toFixed(1)} 240 240)">
    ${mouldStamp(240, 240, 150, C.earth, 7)}
  </g>
</svg>`;
}

/* ---------- 6. OG image & logo mark ---------- */

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.paan900}"/>
  <g opacity="0.08">${mouldStamp(1050, 120, 160, C.kesariya500)}${mouldStamp(140, 540, 200, C.kesariya500)}</g>
  <text x="90" y="330" font-family="Georgia, serif" font-size="108" font-weight="900" fill="${C.kesariya500}">The Desi Pakwan</text>
  <text x="95" y="420" font-family="Arial, sans-serif" font-size="44" fill="${C.pista100}">Ghar ka khasta, ghar tak.</text>
  <text x="95" y="480" font-family="Arial, sans-serif" font-size="28" fill="${C.pista200}" opacity="0.8">Handmade thekua &amp; chakli · Desi ghee · Shipped across India</text>
</svg>`;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="110" fill="${C.paan900}"/>
  ${mouldStamp(256, 256, 190, C.kesariya500, 12)}
</svg>`;

/* ---------- run ---------- */

async function main() {
  // Raw SVGs
  await writeIfMissing(path.join(ROOT, "svg", "mould-pattern.svg"), (f) => writeFile(f, mouldPatternSvg));
  await writeIfMissing(path.join(ROOT, "svg", "chakli-spiral.svg"), (f) => writeFile(f, chakliSpiralSvg));
  await writeIfMissing(path.join(ROOT, "svg", "chai-cup.svg"), (f) => writeFile(f, chaiCupSvg));

  for (const [name, body] of Object.entries(icons)) {
    await writeIfMissing(path.join(ROOT, "icons", `${name}.svg`), (f) =>
      writeFile(f, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${body}</svg>`)
    );
  }

  // Hero stack — transparent PNG
  await writeIfMissing(path.join(ROOT, "hero-thekua-stack.png"), (f) =>
    sharp(svgBuffer(heroSvg)).png().toFile(f)
  );

  // Logo mark
  await writeIfMissing(path.join(ROOT, "logo-mark.png"), (f) =>
    sharp(svgBuffer(logoSvg)).resize(256, 256).png().toFile(f)
  );

  // OG image
  await writeIfMissing(path.join(ROOT, "og-image.jpg"), (f) =>
    sharp(svgBuffer(ogSvg)).jpeg({ quality: 88 }).toFile(f)
  );

  // Product cards
  for (const p of products) {
    for (const v of [1, 2]) {
      await writeIfMissing(path.join(ROOT, "products", `${p.slug}-${v}.jpg`), (f) =>
        sharp(svgBuffer(productSvg(p.name, p.family, v))).jpeg({ quality: 82 }).toFile(f)
      );
    }
  }

  // 60 sequence frames
  const TOTAL = 60;
  for (let i = 0; i < TOTAL; i++) {
    const n = String(i).padStart(3, "0");
    await writeIfMissing(path.join(ROOT, "sequence", `thekua-press-${n}.webp`), (f) =>
      sharp(svgBuffer(frameSvg(i, TOTAL))).webp({ quality: 70 }).toFile(f)
    );
  }

  console.log("\nPlaceholder generation complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
