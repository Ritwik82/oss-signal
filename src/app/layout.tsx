import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Grotesk, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: {
    default: "OSS Signal — FOSS Android app health dashboard",
    template: "%s | OSS Signal",
  },
  description:
    "Prioritize actively maintained FOSS Android apps. Track the ones you rely on and discover the ones worth installing — every score is built from six transparent health signals.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oss-signal.vercel.app"
  ),
  openGraph: {
    title: "OSS Signal — FOSS Android app health dashboard",
    description:
      "Prioritize actively maintained FOSS Android apps. Track the ones you rely on and discover the ones worth installing.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OSS Signal — FOSS Android app health dashboard",
    description:
      "Six transparent health signals. One honest score. Never install abandonware again.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce set by proxy.ts for the CSP; required for the inline theme script.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      data-theme="midnight"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <meta name="theme-color" content="#12161d" />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col isolate">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {/* Fixed graph-paper grid — telemetry texture behind everything */}
        <div className="grid-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
