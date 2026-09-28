export type Family = "thekua" | "chakli" | "namkeen" | "combo";

export interface Variant {
  sku: string; // e.g. "TK-GUR-500"
  label: string; // "500 g"
  weightGrams: number;
  price: number; // INR, integer, inclusive of GST
  compareAt?: number; // optional strike-through, use honestly
  inStock: boolean;
}

export interface Product {
  slug: string;
  name: string;
  hindiName?: string;
  family: Family;
  tagline: string; // one line, ≤ 60 chars
  description: string; // 2–3 sentences
  ingredients: string[];
  sweetness?: 1 | 2 | 3; // sweet items
  spice?: 1 | 2 | 3; // savoury items
  /** Display rating (UI only; kept out of JSON-LD until real reviews exist). */
  rating?: number;
  shelfLifeDays: number;
  images: string[];
  variants: Variant[];
  badges?: ("bestseller" | "new" | "festive" | "gifting")[];
  featured?: boolean;
}

// Launch catalogue — 4 products. Add more by copying an object and giving it
// a unique slug + SKUs (see README: "How to add a product").
export const products: Product[] = [
  {
    slug: "gud-thekua",
    name: "Gud Thekua",
    hindiName: "गुड़ वाला ठेकुआ",
    family: "thekua",
    tagline: "The classic. Jaggery, wheat, desi ghee.",
    description:
      "The thekua every Bihari kitchen swears by. Stone-ground whole wheat, slow-melted jaggery, and desi ghee, pressed in the family mould and fried till deep gold. It's the one you break in half and share over chai.",
    ingredients: ["Whole wheat atta", "Jaggery (gud)", "Desi cow ghee", "Fennel (saunf)", "Green cardamom"],
    sweetness: 2,
    rating: 4.9,
    shelfLifeDays: 40,
    images: ["/images/products/prod-gud-thekua.webp", "/images/products/prod-1.webp"],
    variants: [
      { sku: "TK-GUR-400", label: "400 g", weightGrams: 400, price: 379, inStock: true },
    ],
    badges: ["bestseller"],
    featured: true,
  },
  {
    slug: "cheeni-thekua",
    name: "Cheeni Thekua",
    hindiName: "चीनी ठेकुआ",
    family: "thekua",
    tagline: "Sugar-sweet, extra khasta, kids' favourite.",
    description:
      "Lighter and crisper than the gud classic, with a clean sugar sweetness. This is the one kids hide from each other. Same atta, same ghee, same mould — just a brighter crunch.",
    ingredients: ["Whole wheat atta", "Sugar", "Desi cow ghee", "Green cardamom"],
    sweetness: 3,
    rating: 4.8,
    shelfLifeDays: 40,
    images: ["/images/products/prod-cheeni-thekua.webp", "/images/products/prod-1.webp"],
    variants: [
      { sku: "TK-CHN-400", label: "400 g", weightGrams: 400, price: 369, inStock: true },
    ],
    featured: true,
  },
  {
    slug: "chakli",
    name: "Chakli",
    hindiName: "चकली",
    family: "chakli",
    tagline: "Ajwain, sesame, red chilli. The chai-time spiral.",
    description:
      "Crisp rice-flour spirals with ajwain and sesame in the dough and red chilli for warmth that builds without burning. One spiral is never enough.",
    ingredients: ["Rice flour", "Ajwain", "Sesame", "Red chilli", "Turmeric", "Rock salt", "Groundnut oil"],
    spice: 2,
    rating: 4.8,
    shelfLifeDays: 30,
    images: ["/images/products/prod-chakli.webp", "/images/products/chakli-1.webp"],
    variants: [
      { sku: "CH-CLA-200", label: "200 g", weightGrams: 200, price: 190, inStock: true },
    ],
    badges: ["bestseller"],
    featured: true,
  },
  {
    slug: "namak-pare",
    name: "Namak Pare",
    hindiName: "नमक पारे",
    family: "namkeen",
    tagline: "Flaky, salty, dangerously snackable diamonds.",
    description:
      "Crisp diamond-cut namak pare with ajwain and a whisper of black pepper — flaky outside, khasta all the way through. The savoury one that empties before the chai cools.",
    ingredients: ["Whole wheat atta", "Ajwain", "Black pepper", "Rock salt", "Groundnut oil"],
    spice: 1,
    rating: 4.8,
    shelfLifeDays: 30,
    images: ["/images/products/prod-namakpare.webp", "/images/products/namak-pare-1.webp"],
    variants: [
      { sku: "NP-CLA-400", label: "400 g", weightGrams: 400, price: 299, inStock: true },
    ],
    badges: ["new"],
    featured: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Combos — priced from their parts, so they follow single-product    */
/*  price changes. compareAt is the real "bought separately" total.    */
/* ------------------------------------------------------------------ */



/** Sum of parts, minus the discount, rounded down to a price ending in 9. */
function comboPrice(total: number, discount: number) {
  const discounted = total * (1 - discount);
  return Math.floor((discounted + 1) / 10) * 10 - 1;
}

function comboLabel(jars: number, grams: number) {
  const weight = grams >= 1000 ? `${(grams / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg` : `${grams} g`;
  return `${jars} jars · ${weight}`;
}

function makeCombo(def: {
  slug: string;
  sku: string;
  name: string;
  hindiName: string;
  parts: string[]; // product slugs
  image: string;
  tagline: string;
  description: string;
  rating: number;
  discount: number;
  badges?: Product["badges"];
}): Product {
  const parts = def.parts.map((slug) => {
    const p = products.find((x) => x.slug === slug);
    if (!p) throw new Error(`Unknown combo part: ${slug}`);
    return { product: p, variant: p.variants[0] };
  });
  const separate = parts.reduce((sum, x) => sum + x.variant.price, 0);
  return {
    slug: def.slug,
    name: def.name,
    hindiName: def.hindiName,
    family: "combo",
    tagline: def.tagline,
    description: def.description,
    ingredients: parts.map((x) => `${x.product.name} ${x.variant.label}`),
    rating: def.rating,
    shelfLifeDays: Math.min(...parts.map((x) => x.product.shelfLifeDays)),
    images: [def.image],
    variants: [
      {
        sku: def.sku,
        label: comboLabel(parts.length, parts.reduce((sum, x) => sum + x.variant.weightGrams, 0)),
        weightGrams: parts.reduce((sum, x) => sum + x.variant.weightGrams, 0),
        price: comboPrice(separate, def.discount),
        compareAt: separate,
        inStock: true,
      },
    ],
    badges: def.badges,
  };
}

const combos: Product[] = [
  makeCombo({
    slug: "gud-cheeni-thekua-combo",
    sku: "CO-GUD-CHN",
    image: "/images/products/combo-cheeni-gud.webp",
    name: "Gud + Cheeni Thekua",
    hindiName: "गुड़ + चीनी ठेकुआ",
    parts: ["gud-thekua", "cheeni-thekua"],
    tagline: "Both thekuas. Settle the gud-vs-cheeni debate at home.",
    description:
      "The deep caramel gud classic and the lighter, crisper cheeni thekua, side by side. For the house that can never agree on which one is better.",
    rating: 4.9,
    discount: 0.05,
  }),
  makeCombo({
    slug: "gud-thekua-chakli-combo",
    sku: "CO-GUD-CLA",
    image: "/images/products/combo-chakli-gud.webp",
    name: "Gud Thekua + Chakli",
    hindiName: "गुड़ ठेकुआ + चकली",
    parts: ["gud-thekua", "chakli"],
    tagline: "Sweet meets spice — the classic chai-time pair.",
    description:
      "Gud thekua for the sweet tooth, masala chakli for the crunch. One jar of each, and the 4 PM chai plate is sorted for the week.",
    rating: 4.9,
    discount: 0.05,
  }),
  makeCombo({
    slug: "cheeni-thekua-chakli-combo",
    sku: "CO-CHN-CLA",
    image: "/images/products/combo-chakli-cheeni.webp",
    name: "Cheeni Thekua + Chakli",
    hindiName: "चीनी ठेकुआ + चकली",
    parts: ["cheeni-thekua", "chakli"],
    tagline: "The kids' favourite with a spicy sidekick.",
    description:
      "Crisp cheeni thekua and ajwain-sesame chakli — a sweet-and-savoury pair that disappears from the dabba faster than you can refill it.",
    rating: 4.8,
    discount: 0.05,
  }),
  makeCombo({
    slug: "gud-thekua-namak-pare-combo",
    sku: "CO-GUD-NP",
    image: "/images/products/combo-namakpare-gud.webp",
    name: "Gud Thekua + Namak Pare",
    hindiName: "गुड़ ठेकुआ + नमक पारे",
    parts: ["gud-thekua", "namak-pare"],
    tagline: "Gud sweetness, namkeen crunch.",
    description:
      "Our bestselling gud thekua with flaky, ajwain-flecked namak pare. Two jars that cover every craving between breakfast and dinner.",
    rating: 4.9,
    discount: 0.05,
  }),
  makeCombo({
    slug: "cheeni-thekua-namak-pare-combo",
    sku: "CO-CHN-NP",
    image: "/images/products/combo-namakpare-cheeni.webp",
    name: "Cheeni Thekua + Namak Pare",
    hindiName: "चीनी ठेकुआ + नमक पारे",
    parts: ["cheeni-thekua", "namak-pare"],
    tagline: "Light, crisp and gone by evening.",
    description:
      "Cheeni thekua and namak pare — a lighter sweet-and-salty pair that's perfect for guests, tiffins and long train journeys.",
    rating: 4.8,
    discount: 0.05,
  }),
  makeCombo({
    slug: "chakli-namak-pare-combo",
    sku: "CO-CLA-NP",
    image: "/images/products/combo-namakpare-chakli.webp",
    name: "Chakli + Namak Pare",
    hindiName: "चकली + नमक पारे",
    parts: ["chakli", "namak-pare"],
    tagline: "The all-namkeen box for the savoury crowd.",
    description:
      "Masala chakli spirals and crisp namak pare — two savoury favourites for the people who skip the mithai and head straight for the crunch.",
    rating: 4.8,
    discount: 0.05,
  }),
  makeCombo({
    slug: "complete-desi-pakwan-box",
    sku: "CO-ALL-4",
    image: "/images/products/combo-namakpare-chakli-gud-cheeni.webp",
    name: "The Complete Box",
    hindiName: "पूरा पकवान डिब्बा",
    parts: ["gud-thekua", "cheeni-thekua", "chakli", "namak-pare"],
    tagline: "All four favourites. The best way to try everything.",
    description:
      "Gud thekua, cheeni thekua, chakli and namak pare — the whole Desi Pakwan kitchen in one order. Made for gifting, festivals, and anyone who can't choose.",
    rating: 4.9,
    discount: 0.1,
    badges: ["gifting"],
  }),
];

products.push(...combos);

/** Single products only — used where combos shouldn't appear (home, suggestions). */
export const singleProducts = () => products.filter((p) => p.family !== "combo");

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function findVariant(sku: string): { product: Product; variant: Variant } | undefined {
  for (const product of products) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export const featuredProducts = () => products.filter((p) => p.featured);

export const familyLabel: Record<Family, string> = {
  thekua: "Thekua",
  chakli: "Chakli",
  namkeen: "Namkeen",
  combo: "Combo",
};
