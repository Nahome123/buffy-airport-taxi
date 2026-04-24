import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/google-analytics";
import { getAppUrl, getGoogleAnalyticsMeasurementId } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "Buffy Airport Taxi",
    template: "%s | Buffy Airport Taxi",
  },
  description:
    "Private Buffalo airport taxi booking with live fare estimates, Niagara Falls transfers, and direct online or cash reservation options.",
  keywords: [
    "Buffalo airport taxi",
    "Buffalo airport transfer",
    "Buffalo taxi service",
    "Buffalo to Niagara Falls taxi",
    "Niagara Falls airport ride",
    "BUF airport transportation",
  ],
  applicationName: "Buffy Airport Taxi",
  category: "transportation",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Buffy Airport Taxi",
    siteName: "Buffy Airport Taxi",
    description:
      "Book Buffalo airport transfers with live route pricing, flexible payment options, and a polished local dispatch experience.",
    images: [
      {
        url: "/buffalo-waterfront.svg",
        width: 1200,
        height: 630,
        alt: "Buffy Airport Taxi Buffalo skyline artwork",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buffy Airport Taxi",
    description:
      "Book Buffalo airport transfers with live route pricing and flexible payment options.",
    images: ["/buffalo-waterfront.svg"],
  },
  verification: {
    google: "9CbLO-eZnVzN25VyKY8pIaVgVwzkxRn6pRlXRh4V8QE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = getGoogleAnalyticsMeasurementId();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-ink)] text-[var(--color-paper)]">
        {gaMeasurementId ? (
          <GoogleAnalytics measurementId={gaMeasurementId} />
        ) : null}
        {children}
      </body>
    </html>
  );
}
