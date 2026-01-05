export const TOPICS = [
  "words",
  "geography",
  "trivia",
  "nature",
  "food",
  "sports",
  "colors",
  "estimation",
  "logic",
  "history",
  "movies_tv",
  "music",
  "shapes",
  "video_games",
  "board_games",
];

export const TOPIC_COLORS: Record<string, string> = {
  words: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  geography: "bg-green-500/20 text-green-700 dark:text-green-300",
  trivia: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  nature: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  food: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  sports: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  colors: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  estimation: "bg-teal-500/20 text-teal-700 dark:text-teal-300",
  logic: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  history: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  movies_tv: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  music: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  shapes: "bg-lime-500/20 text-lime-700 dark:text-lime-300",
  video_games: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
  board_games: "bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300",
};

export const TOPIC_BAR_COLORS: Record<string, string> = {
  words: "bg-blue-500",
  geography: "bg-green-500",
  trivia: "bg-yellow-500",
  nature: "bg-emerald-500",
  food: "bg-orange-500",
  sports: "bg-cyan-500",
  colors: "bg-indigo-500",
  estimation: "bg-teal-500",
  logic: "bg-slate-500",
  history: "bg-amber-500",
  movies_tv: "bg-violet-500",
  music: "bg-rose-500",
  shapes: "bg-lime-500",
  video_games: "bg-sky-500",
  board_games: "bg-fuchsia-500",
};

export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain;
  } catch {
    return url;
  }
}
