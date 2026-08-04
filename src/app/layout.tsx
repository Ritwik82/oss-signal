import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Playfair_Display } from "next/font/google";
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

const themeScript = `
(function() {
  var t = localStorage.getItem('oss-signal-theme');
  if (t === 'light') document.documentElement.classList.remove('dark');
  else document.documentElement.classList.add('dark');
})()
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} h-full antialiased dark scroll-smooth`}
    >
      <head>
        <meta name="theme-color" content="#1a1714" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col isolate">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {/* Ambient aurora — sits behind all content so glass surfaces have something to blur */}
        <div className="aurora" aria-hidden="true" />
        {/* Fixed graph-paper grid — telemetry texture behind everything */}
        <div className="grid-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
