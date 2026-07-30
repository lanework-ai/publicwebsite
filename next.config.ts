import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Prisma configuration for Turbopack compatibility
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Image optimization — use a custom loader that serves Sanity images straight
  // from Sanity's free image CDN (with transform params), bypassing Netlify's
  // metered Image CDN. Non-Sanity sources pass through unchanged.
  images: {
    loader: 'custom',
    loaderFile: './lib/sanityImageLoader.ts',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // "Proofs" (/products) and "Field work" (/case-studies) covered the same three
  // deployments, so they merged into /field-work. Keep the old paths resolving.
  async redirects() {
    return [
      { source: '/products', destination: '/field-work', permanent: true },
      { source: '/products/rapid-relay', destination: '/field-work/rapid-relay-orchestration', permanent: true },
      { source: '/case-studies', destination: '/field-work', permanent: true },
      { source: '/case-studies/:slug', destination: '/field-work/:slug', permanent: true },
      // Who we serve was absorbed into the engagements page, which now carries
      // both the buyer tracks and what each can hire us for.
      { source: '/who-we-serve', destination: '/engagements', permanent: true },
      // Last rapid-relay-* content slug, renamed in Sanity during the rebrand.
      // The same doc is served by rapidrelay.ai, which carries a matching redirect.
      {
        source: '/blog/rapid-relay-take-on-logistics-investments-and-developments',
        destination: '/blog/lanework-take-on-logistics-investments-and-developments',
        permanent: true,
      },
    ]
  },

  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
