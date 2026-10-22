export type Family = "thekua" | "chakli" | "namkeen" | "combo";

export interface Variant {
  sku: string; // e.g. "TK-GUR-500"
  label: string; // "500 g"
  weightGrams: number;
  price: number; // INR, integer, inclusive of GST
  compareAt?: number; // optional strike-through, use honestly (single products: the MRP)
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
    ingredients: ["Whole wheat atta", "Jaggery (gud)", "Desi ghee", "Elaichi", "Saunf", "Dry coconut", "Rice bran oil"],
    sweetness: 2,
    rating: 4.9,
    shelfLifeDays: 60,
    images: ["/images/products/prod-gud-thekua.webp", "/images/products/prod-1.webp"],
    variants: [
      { sku: "TK-GUR-400", label: "400 g", weightGrams: 400, price: 379, compareAt: 470, inStock: true },
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
    ingredients: ["Whole wheat atta", "Sugar (cheeni)", "Desi ghee", "Elaichi", "Saunf", "Dry coconut", "Rice bran oil"],
    sweetness: 3,
    rating: 4.8,
    shelfLifeDays: 60,
    images: ["/images/products/prod-cheeni-thekua.webp", "/images/products/prod-1.webp"],
    variants: [
      { sku: "TK-CHN-400", label: "400 g", weightGrams: 400, price: 369, compareAt: 450, inStock: true },
    ],
    featured: true,
  },
  {
    slug: "chakli",
    name: "Chakli",
    hindiName: "चकली",
    family: "chakli",
    tagline: "Besan, til, red chilli. The chai-time spiral.",
    description:
      "Crisp atta-and-besan spirals with til and hing in the dough and red chilli for warmth that builds without burning. One spiral is never enough.",
    ingredients: ["Whole wheat atta", "Besan", "Desi ghee", "Rice bran oil", "Sesame seeds (til)", "Hing", "Turmeric", "Red chilli", "Salt", "Traditional spices"],
    spice: 2,
    rating: 4.8,
    shelfLifeDays: 60,
    images: ["/images/products/prod-chakli.webp", "/images/products/chakli-1.webp"],
    variants: [
      // SKU keeps the old "200" so saved carts keep working; the jar is now 250 g
      { sku: "CH-CLA-200", label: "250 g", weightGrams: 250, price: 239, compareAt: 290, inStock: true },
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
      "Crisp diamond-cut namak pare with ajwain and kalonji — flaky outside, khasta all the way through. The savoury one that empties before the chai cools.",
    ingredients: ["Whole wheat atta", "Salt", "Ajwain", "Kalonji", "Rice bran oil", "Desi ghee"],
    spice: 1,
    rating: 4.8,
    shelfLifeDays: 30,
    images: ["/images/products/prod-namakpare.webp", "/images/products/namak-pare-1.webp"],
    variants: [
      { sku: "NP-CLA-400", label: "400 g", weightGrams: 400, price: 299, compareAt: 440, inStock: true },
    ],
    badges: ["new"],
    featured: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Combos — priced from their parts (so they follow single-product    */
/*  price changes) unless given a fixed price. compareAt is the combo's */
/*  MRP: the one set here, else its jars' MRPs added up.                */
/* ------------------------------------------------------------------ */



/** Sum of parts, minus the discount, rounded down to a price ending in 9. */
function comboPrice(total: number, discount: number) {
  const discounted = total * (1 - discount);
  return Math.floor((discounted + 1) / 10) * 10 - 1;
}

function comboLabel(jars: number, grams: number) {
  const weight = grams >= 1000 ? `${(grams / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg` : `${grams} g`;
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
  /** Fraction off the parts' total (ignored when `price` is set). */
  discount?: number;
  /** Fixed combo price in ₹ — the owner's set price instead of the formula. */
  price?: number;
  /** The combo's MRP in ₹, shown struck through (default: its jars' MRPs added up). */
  mrp?: number;
  badges?: Product["badges"];
}): Product {
  const parts = def.parts.map((slug) => {
    const p = products.find((x) => x.slug === slug);
    if (!p) throw new Error(`Unknown combo part: ${slug}`);
    return { product: p, variant: p.variants[0] };
  });
  const separate = parts.reduce((sum, x) => sum + x.variant.price, 0);
  const price = def.price ?? comboPrice(separate, def.discount ?? 0);
  const mrp = def.mrp ?? parts.reduce((sum, x) => sum + (x.variant.compareAt ?? x.variant.price), 0);
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
        price,
        compareAt: mrp > price ? mrp : undefined,
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
    price: 599,
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
    price: 589,
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
    price: 519,
  }),
  makeCombo({
    slug: "namak-pare-chakli-gud-thekua-combo",
    sku: "CO-NP-CLA-GUD",
    image: "/images/products/combo-namakpare-chakli-gud.webp",
    name: "Namak Pare + Chakli + Gud Thekua",
    hindiName: "नमक पारे + चकली + गुड़ ठेकुआ",
    parts: ["namak-pare", "chakli", "gud-thekua"],
    tagline: "Two namkeens and the gud classic. Every craving covered.",
    description:
      "Flaky namak pare, masala chakli and our bestselling gud thekua — salty, spicy and sweet in one order. Three jars that keep the whole house happy from breakfast to the evening chai.",
    rating: 4.9,
    price: 859,
    mrp: 1200,
  }),
  makeCombo({
    slug: "cheeni-thekua-chakli-gud-thekua-combo",
    sku: "CO-CHN-CLA-GUD",
    image: "/images/products/combo-cheeni-chakli-gud.webp",
    name: "Cheeni Thekua + Chakli + Gud Thekua",
    hindiName: "चीनी ठेकुआ + चकली + गुड़ ठेकुआ",
    parts: ["cheeni-thekua", "chakli", "gud-thekua"],
    tagline: "Both thekuas, with a spicy chakli in between.",
    description:
      "Gud thekua and cheeni thekua for the sweet-tooth debate, plus a jar of masala chakli for the crunch. The thekua lover's box, with something savoury to go with the chai.",
    rating: 4.9,
    price: 899,
    mrp: 1210,
  }),
  makeCombo({
    slug: "namak-pare-chakli-cheeni-thekua-combo",
    sku: "CO-NP-CLA-CHN",
    image: "/images/products/combo-namakpare-chakli-cheeni.webp",
    name: "Namak Pare + Chakli + Cheeni Thekua",
    hindiName: "नमक पारे + चकली + चीनी ठेकुआ",
    parts: ["namak-pare", "chakli", "cheeni-thekua"],
    tagline: "Salty, spicy, and the kids' favourite sweet.",
    description:
      "Crisp namak pare, masala chakli and the lighter, sugar-sweet cheeni thekua. A sweet-and-savoury trio for guests, tiffins and long train journeys.",
    rating: 4.8,
    price: 849,
    mrp: 1180,
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
    price: 1159,
    mrp: 1650,
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
