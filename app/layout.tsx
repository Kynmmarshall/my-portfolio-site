import type { Metadata } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { VisualPreferencesProvider } from "@/context/VisualPreferencesContext";
import { ReactiveBackground } from "@/components/motion/ReactiveBackground";
import { ThemeProvider } from "@/context/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Kynmmarshall | Software, systems & a little play",
    template: "%s | Kynmmarshall",
  },
  description:
    "Kamdeu Yamdjeuson Neil Marshall. Software engineer building cross-platform applications, interactive games, and deployment automation in Cameroon.",
  ...(process.env.SITE_URL
    ? { metadataBase: new URL(process.env.SITE_URL) }
    : {}),
  openGraph: {
    type: "website",
    siteName: "Kynmmarshall",
    title: "Software, systems & a little play.",
    description:
      "The work of Kamdeu Yamdjeuson Neil Marshall. Full-stack development, games, and DevOps.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="system">
      <body>
        <ThemeProvider>
          <VisualPreferencesProvider>
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main">
              <ReactiveBackground />
              {children}
            </main>
            <SiteFooter />
          </VisualPreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
