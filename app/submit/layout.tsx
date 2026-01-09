import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Game",
  description:
    "Suggest a new daily game or puzzle to be added to the dles.fun collection.",
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
