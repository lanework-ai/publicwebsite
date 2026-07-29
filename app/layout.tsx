import type { Metadata } from "next";
import "./globals.css";
import "./labs-theme.css";
import LabsNav from "@/components/labs/LabsNav";
import LabsFooter from "@/components/labs/LabsFooter";
import SectionReveal from "@/components/labs/SectionReveal";
import Pixels from "@/components/Analytics/Pixels";
import PostHogProvider from "@/components/Analytics/PostHogProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lanework.ai";

const DESCRIPTION =
  "An applied research lab for logistics and supply chain. We embed with operators across freight, fulfillment, and warehousing, turn the data they already hold into independent research, and build the software that proves it.";

export const metadata: Metadata = {
  title: "Lanework | Applied research for logistics",
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: "Lanework",
  authors: [{ name: "Lanework" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Lanework",
    title: "Lanework | Applied research for logistics",
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lanework" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lanework | Applied research for logistics",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },
  alternates: {
    types: { "application/rss+xml": "/research/feed.xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#08090a" />
        {/* Machine-readable statement of who we are and what we cover. The
            knowsAbout list is the structured-data counterpart to /llms.txt, and
            is what declares the scope beyond freight to search and answer engines. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': `${SITE_URL}/#organization`,
                name: 'Lanework',
                url: SITE_URL,
                logo: `${SITE_URL}/icon.svg`,
                image: `${SITE_URL}/og-image.png`,
                description: DESCRIPTION,
                knowsAbout: [
                  'Logistics',
                  'Supply chain operations',
                  'Freight and trucking networks',
                  'Fulfillment operations',
                  'Warehousing',
                  'Last mile delivery',
                  'Inventory management',
                  'Procurement',
                  'Frontline labor retention',
                  'Network design',
                  'Asset utilization',
                  'Operational due diligence',
                ],
                areaServed: 'US',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: SITE_URL,
                name: 'Lanework',
                description: DESCRIPTION,
                publisher: { '@id': `${SITE_URL}/#organization` },
              },
            ]),
          }}
        />
      </head>
      <body className="antialiased">
        <Pixels />
        <PostHogProvider>
          <div className="ll-root">
            <a href="#main" className="ll-skip">
              Skip to content
            </a>
            <LabsNav />
            <main id="main">{children}</main>
            <LabsFooter />
            <SectionReveal />
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}
