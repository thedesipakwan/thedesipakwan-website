/** Run: npx tsx --tsconfig scripts/tsconfig.scripts.json scripts/pricing-check.ts */
import { cartFromPaidItems } from "../lib/pricing";

// paid today's price → no flag
const a = cartFromPaidItems([{ sku: "TK-GUR-400", qty: 2, price: 379 }], 0);
console.log("current price:", a.cart.total, "flagged:", a.priceChanged);

// paid an old price (349) → flagged; email shows what was actually paid
const b = cartFromPaidItems([{ sku: "TK-GUR-400", qty: 2, price: 349 }], 0);
console.log("old price:", b.cart.total, "flagged:", b.priceChanged);

// product removed from the catalogue → still reported, flagged
const c = cartFromPaidItems([{ sku: "OLD-ITEM-1", qty: 1, price: 199 }], 49);
console.log("removed product:", c.cart.lines[0].name, c.cart.total, "flagged:", c.priceChanged);
