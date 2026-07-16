import type { Metadata } from "next";
import "./globals.css";
import "./labs-theme.css";
import LabsNav from "@/components/labs/LabsNav";
import LabsFooter from "@/components/labs/LabsFooter";
import Pixels from "@/components/Analytics/Pixels";
import PostHogProvider from "@/components/Analytics/PostHogProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lanework.ai";

const DESCRIPTION =
  "An applied research lab for logistics. We turn the operational data the freight industry already holds into independent research, and into software when it proves out.";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Lanework | Applied research for logistics",
    description: DESCRIPTION,
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
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}
