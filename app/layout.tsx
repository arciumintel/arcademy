import type { Metadata } from "next";
import { Fraunces, Source_Serif_4, JetBrains_Mono, Inter } from "next/font/google";
import PortalShell from "@/components/portal/PortalShell";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arcidex — Ecosystem onboarding for Arcium",
    template: "%s | Arcidex",
  },
  description:
    "Arcidex is the shared learning checkpoint for the Arcium ecosystem. Partner apps verify user comprehension; learners get one account and a curated catalog of programs.",
  keywords: ["Arcidex", "Arcium", "onboarding", "ecosystem", "learning", "MXE", "confidential compute"],
  openGraph: {
    siteName: "Arcidex",
    type: "website",
    title: "Arcidex — Ecosystem onboarding for Arcium",
    description:
      "The shared learning checkpoint for the Arcium ecosystem.",
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
      className={`scroll-smooth ${fraunces.variable} ${sourceSerif.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-background font-body text-ink antialiased selection:bg-accent-soft selection:text-ink">
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
