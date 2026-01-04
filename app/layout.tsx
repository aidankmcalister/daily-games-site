import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ImpersonationProvider } from "@/components/impersonation-provider";
import { Toaster } from "@/components/ui/sonner";
import { ListsProvider } from "@/lib/use-lists";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Games - Your Daily Puzzle Collection",
  description:
    "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more. Progress resets at midnight.",
  openGraph: {
    title: "Daily Games - Your Daily Puzzle Collection",
    description:
      "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Games - Your Daily Puzzle Collection",
    description:
      "A curated collection of daily puzzles and games. Play word games, trivia, geography challenges, and more.",
    images: ["/og-image.png"],
  },
};

import { ShortcutsHelp } from "@/components/shortcuts-help";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ImpersonationProvider>
            <ListsProvider>{children}</ListsProvider>
          </ImpersonationProvider>
          <Toaster />
          <ShortcutsHelp />
        </ThemeProvider>
      </body>
    </html>
  );
}
