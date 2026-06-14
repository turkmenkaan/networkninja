import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SessionBridge } from "@/components/auth/SessionBridge";
import { SITE_URL } from "@/lib/site";

/**
 * Type system:
 *  - Display: Bricolage Grotesque — a contemporary grotesque with real
 *    personality in its wider weights; carries the brand headlines.
 *  - Body: Hanken Grotesk — clean, humanist, excellent for long-form reading.
 *  - Mono: JetBrains Mono — the terminal voice for CLI snippets & FRR configs.
 * Deliberately NOT Inter / Roboto / Space Grotesk.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NetworkNinjas — Hands-on networking, master BGP",
    template: "%s · NetworkNinjas",
  },
  description:
    "Learn networking the way operators actually work: read the theory, then drop into real FRR labs you run yourself with Containerlab. Starting with BGP.",
  keywords: [
    "BGP",
    "OSPF",
    "BGP lab",
    "learn BGP",
    "Containerlab",
    "FRRouting",
    "FRR BGP config",
    "eBGP",
    "iBGP",
    "hands-on networking",
    "network engineering",
    "networking labs",
  ],
  applicationName: "NetworkNinjas",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NetworkNinjas — Hands-on networking, master BGP",
    description:
      "Interactive networking education + Containerlab labs. Master BGP, hands-on.",
    url: "/",
    siteName: "NetworkNinjas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NetworkNinjas — Hands-on networking, master BGP",
    description:
      "Learn networking by running real FRR routers with Containerlab. Master BGP, hands-on.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen">
        <SessionBridge />
        <SiteHeader />
        <main className="relative overflow-x-clip">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
