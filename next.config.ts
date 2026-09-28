import type { NextConfig } from "next";

const securityHeaders = [
  // no other site may embed these pages (stops click-jacking on checkout)
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  // browsers must always use HTTPS for this site (ignored on localhost)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // products renamed (Chini → Cheeni, Gur → Gud); keep old links and search results working
      { source: "/product/chini-thekua", destination: "/product/cheeni-thekua", permanent: true },
      { source: "/product/gur-thekua", destination: "/product/gud-thekua", permanent: true },
    ];
  },
};

export default nextConfig;
