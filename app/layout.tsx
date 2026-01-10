import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ImpersonationProvider } from "@/components/impersonation-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ListsProvider } from "@/lib/use-lists";
import { SettingsProvider } from "@/components/settings-provider";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dles.fun"),
  title: {
    default: "dles.fun - Daily Games Dashboard",
    template: "%s | dles.fun",
  },
  description:
    "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
  keywords: [
    "daily games",
    "wordle",
    "puzzles",
    "trivia",
    "brain games",
    "word games",
  ],
  authors: [{ name: "dles.fun" }],
  creator: "dles.fun",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dles.fun",
    siteName: "dles.fun",
    title: "dles.fun - Daily Games Dashboard",
    description:
      "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "dles.fun - Your daily game dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "dles.fun - Daily Games Dashboard",
    description:
      "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ShortcutsHelp } from "@/components/shortcuts-help";
import { SiteBanner } from "@/components/layout/site-banner";
import { ClientLayout } from "@/components/layout/client-layout";
import { StatsProvider } from "@/lib/stats-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="2ce02139-c430-4934-9546-f333cb23011e"
        ></script>
      </head>
      <body className={`${jetbrainsMono.className} antialiased`}>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <ImpersonationProvider>
            <Analytics />
            <SpeedInsights />
            <SettingsProvider>
              <SiteBanner />
              <ListsProvider>
                <StatsProvider>
                  <ClientLayout>{children}</ClientLayout>
                </StatsProvider>
              </ListsProvider>
            </SettingsProvider>
          </ImpersonationProvider>
          <Toaster />
          <ShortcutsHelp />
        </ThemeProvider>
      </body>
    </html>
  );
}
