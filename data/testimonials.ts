export interface Testimonial {
  quote: string;
  name: string;
  city: string;
  stars: 4 | 5;
}

// Placeholder testimonials — replace with real customer reviews before launch.
export const testimonials: Testimonial[] = [
  {
    quote: "Exactly like Nani's. My kids finished the jar in two days.",
    name: "Priya S.",
    city: "Bengaluru",
    stars: 5,
  },
  {
    quote: "Ordered for Chhath from Pune. Reached in four days, not one broken.",
    name: "Rakesh K.",
    city: "Pune",
    stars: 5,
  },
  {
    quote: "The chakli is dangerous. Ordered twice this month.",
    name: "Ananya M.",
    city: "Delhi",
    stars: 5,
  },
  {
    quote: "Finally a thekua that isn't rock hard. Soft crunch, real gud.",
    name: "Vivek T.",
    city: "Gurugram",
    stars: 5,
  },
  {
    quote: "Sent a box to my in-laws. They called before I did.",
    name: "Shreya R.",
    city: "Mumbai",
    stars: 5,
  },
  {
    quote: "You can taste the ghee. That's the whole review.",
    name: "Arjun P.",
    city: "Hyderabad",
    stars: 4,
  },
  {
    quote: "Butter chakli with evening chai has become a house rule.",
    name: "Neha D.",
    city: "Noida",
    stars: 5,
  },
  {
    quote: "Packing was so good the courier guy asked what's inside.",
    name: "Imran S.",
    city: "Lucknow",
    stars: 4,
  },
];
