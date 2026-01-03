import type { Topic } from "@/app/generated/prisma/client";

export const TOPICS: Topic[] = [
  "words",
  "puzzle",
  "geography",
  "trivia",
  "entertainment",
  "gaming",
  "nature",
  "food",
  "sports",
];

export const TOPIC_COLORS: Record<string, string> = {
  words: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  puzzle: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  geography: "bg-green-500/20 text-green-700 dark:text-green-300",
  trivia: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  entertainment: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  gaming: "bg-red-500/20 text-red-700 dark:text-red-300",
  nature: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  food: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  sports: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
};

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
