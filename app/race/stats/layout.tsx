import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Stats",
  description:
    "View global race statistics and leaderboards for dles.fun competitive gaming.",
};

export default function RaceStatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  );
}
