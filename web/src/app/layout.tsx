import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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
  metadataBase: new URL("https://networkninja.local"),
  title: {
    default: "NetworkNinja — Hands-on networking, master BGP",
    template: "%s · NetworkNinja",
  },
  description:
    "Learn networking the way operators actually work: read the theory, then drop into real FRR labs you run yourself with Containerlab. Starting with BGP.",
  openGraph: {
    title: "NetworkNinja",
    description:
      "Interactive networking education + Containerlab labs. Master BGP, hands-on.",
    type: "website",
  },
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
        <SiteHeader />
        <main className="relative">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
