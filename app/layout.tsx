import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ImpersonationProvider } from "@/components/impersonation-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { ListsProvider } from "@/lib/use-lists";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "dles.fun",
  description:
    "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
  openGraph: {
    title: "dles.fun",
    description:
      "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "dles.fun",
    description:
      "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
    images: ["/og-image.png"],
  },
};

import { ShortcutsHelp } from "@/components/shortcuts-help";
import { SiteBanner } from "@/components/site-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className={`${jetbrainsMono.className} antialiased`}>
        <ThemeProvider>
          <ImpersonationProvider>
            <Analytics />
            <SiteBanner />
            <ListsProvider>{children}</ListsProvider>
          </ImpersonationProvider>
          <Toaster />
          <ShortcutsHelp />
        </ThemeProvider>
      </body>
    </html>
  );
}
