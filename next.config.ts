import type { NextConfig } from "next";

// Derive the Supabase hostname from env so next/image can serve product photos.
const supabaseHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
})();

const csp = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval' are required by Next.js' runtime + dev HMR.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https://*.razorpay.com",
  "img-src 'self' data: blob: https://*.supabase.co https://picsum.photos https://lh3.googleusercontent.com https://*.razorpay.com",
  "frame-src 'self' https://*.razorpay.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.razorpay.com https://*.googleapis.com",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
      // Transitional: legacy placeholder images. Safe to remove once all
      // products use real Supabase Storage images.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
