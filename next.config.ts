import type { NextConfig } from "next";

// Extract R2 public URL hostname for image optimization allowlisting
function getR2Hostname(): string | null {
  const r2Url = process.env.R2_PUBLIC_URL;
  if (!r2Url) return null;
  try {
    return new URL(r2Url).hostname;
  } catch {
    return null;
  }
}

const r2Hostname = getR2Hostname();

const nextConfig: NextConfig = {
  // ── Standalone output for Railway / Docker deployments ──────────────────────
  // Produces a self-contained .next/standalone directory that doesn't need
  // node_modules installed at runtime — Railway can serve it directly.
  output: "standalone",

  // ── Image optimization ───────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket (e.g. pub-xxxx.r2.dev or custom domain)
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
              pathname: "/**",
            },
          ]
        : []),
      // Fallback wildcard for any *.r2.dev CDN URL
      {
        protocol: "https" as const,
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      // Google user profile pictures (used by Google OAuth)
      {
        protocol: "https" as const,
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  // ── Security headers ─────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ── Suppress noisy warnings from Supabase JS client (kept as dep but not used for DB) ──
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
