export interface Testimonial {
  quote: string;
  name: string;
  city: string;
  /** 1–5, one decimal (e.g. 4.8) */
  stars: number;
}

// Placeholder testimonials — replace with real customer reviews before launch.
export const testimonials: Testimonial[] = [
  {
    quote: "Tasted exactly like the thekua my mother makes for Chhath. Ordering again for Diwali.",
    name: "Sunita M.",
    city: "Patna",
    stars: 5,
  },
  {
    quote: "Gud thekua with filter coffee sounds odd, but it works. Very fresh.",
    name: "Rohit K.",
    city: "Bengaluru",
    stars: 4.8,
  },
  {
    quote: "Chakli stayed crisp for two weeks. Not oily at all.",
    name: "Anjali V.",
    city: "Pune",
    stars: 4.9,
  },
  {
    quote: "Namak pare are perfectly salted. Wish the jar was a little bigger.",
    name: "Saurabh J.",
    city: "Delhi",
    stars: 4.6,
  },
  {
    quote: "My kids prefer the cheeni thekua. The jar was gone in three days.",
    name: "Pooja R.",
    city: "Hyderabad",
    stars: 4.7,
  },
  {
    quote: "Good taste and neat packing. Took six days to reach, but worth the wait.",
    name: "Amit S.",
    city: "Kolkata",
    stars: 4.5,
  },
  {
    quote: "Sent a box to my parents in Jaipur. Papa called just to ask where I got it.",
    name: "Ritu A.",
    city: "Mumbai",
    stars: 5,
  },
  {
    quote: "Real desi ghee taste, not the vanaspati kind. Already placed my second order.",
    name: "Vikram T.",
    city: "Noida",
    stars: 4.8,
  },
  {
    quote: "Thekua was slightly harder than I like, but the flavour is spot on.",
    name: "Kavita N.",
    city: "Ahmedabad",
    stars: 4.6,
  },
  {
    quote: "Every piece arrived whole. The packing is really careful.",
    name: "Manish P.",
    city: "Gurugram",
    stars: 4.9,
  },
  {
    quote: "Chakli with evening chai is now a daily habit at home.",
    name: "Neha G.",
    city: "Lucknow",
    stars: 4.7,
  },
  {
    quote: "Missed this taste since leaving Bihar. A bit pricey, but genuine.",
    name: "Rahul D.",
    city: "Chennai",
    stars: 4.5,
  },
];
