"use client";

import Accordion from "@/components/ui/Accordion";

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  return <Accordion items={items.map((f) => ({ title: f.q, content: <p>{f.a}</p> }))} />;
}
