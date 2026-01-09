import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Race",
  description:
    "Challenge friends to a race through daily games. Pick your games and see who finishes fastest!",
};

export default function NewRaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
