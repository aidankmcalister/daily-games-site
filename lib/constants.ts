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
  words:
    "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 border",
  geography:
    "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 border",
  trivia:
    "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300 border",
  nature:
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 border",
  food: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 border",
  sports:
    "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 border",
  colors:
    "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 border",
  estimation:
    "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300 border",
  logic:
    "bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300 border",
  history:
    "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 border",
  movies_tv:
    "bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300 border",
  music:
    "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 border",
  shapes:
    "bg-lime-500/10 border-lime-500/30 text-lime-700 dark:text-lime-300 border",
  video_games:
    "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300 border",
  board_games:
    "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 border",
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

// Hover shadow effects for game cards
export const TOPIC_SHADOWS: Record<string, string> = {
  words: "hover:shadow-blue-500/25 dark:hover:shadow-blue-500/10",
  geography: "hover:shadow-green-500/25 dark:hover:shadow-green-500/10",
  trivia: "hover:shadow-yellow-500/25 dark:hover:shadow-yellow-500/10",
  nature: "hover:shadow-emerald-500/25 dark:hover:shadow-emerald-500/10",
  food: "hover:shadow-orange-500/25 dark:hover:shadow-orange-500/10",
  sports: "hover:shadow-cyan-500/25 dark:hover:shadow-cyan-500/10",
  colors: "hover:shadow-indigo-500/25 dark:hover:shadow-indigo-500/10",
  estimation: "hover:shadow-teal-500/25 dark:hover:shadow-teal-500/10",
  logic: "hover:shadow-slate-500/25 dark:hover:shadow-slate-500/10",
  history: "hover:shadow-amber-500/25 dark:hover:shadow-amber-500/10",
  movies_tv: "hover:shadow-violet-500/25 dark:hover:shadow-violet-500/10",
  music: "hover:shadow-rose-500/25 dark:hover:shadow-rose-500/10",
  shapes: "hover:shadow-lime-500/25 dark:hover:shadow-lime-500/10",
  video_games: "hover:shadow-sky-500/25 dark:hover:shadow-sky-500/10",
  board_games: "hover:shadow-fuchsia-500/25 dark:hover:shadow-fuchsia-500/10",
};

export const LIST_COLORS: Record<string, string> = {
  slate: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  red: "bg-red-500/20 text-red-700 dark:text-red-300",
  orange: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  amber: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  yellow: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  lime: "bg-lime-500/20 text-lime-700 dark:text-lime-300",
  green: "bg-green-500/20 text-green-700 dark:text-green-300",
  emerald: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  teal: "bg-teal-500/20 text-teal-700 dark:text-teal-300",
  cyan: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  sky: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
  blue: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  indigo: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  violet: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  purple: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  fuchsia: "bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300",
  pink: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  rose: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
};

// Card styling matching TOPIC_COLORS style - bg + border + text
export const LIST_CARD_STYLES: Record<
  string,
  { card: string; dot: string; button: string }
> = {
  brand: {
    card: "bg-brand-500/10 border-brand-500/30 text-brand-700 dark:text-brand-300",
    dot: "bg-brand-500",
    button: "text-brand-600 dark:text-brand-400 hover:bg-brand-500/10",
  },
  slate: {
    card: "bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
    button: "text-slate-600 dark:text-slate-400 hover:bg-slate-500/10",
  },
  red: {
    card: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
    button: "text-red-600 dark:text-red-400 hover:bg-red-500/10",
  },
  orange: {
    card: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    button: "text-orange-600 dark:text-orange-400 hover:bg-orange-500/10",
  },
  amber: {
    card: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    button: "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
  },
  yellow: {
    card: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
    dot: "bg-yellow-500",
    button: "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10",
  },
  lime: {
    card: "bg-lime-500/10 border-lime-500/30 text-lime-700 dark:text-lime-300",
    dot: "bg-lime-500",
    button: "text-lime-600 dark:text-lime-400 hover:bg-lime-500/10",
  },
  green: {
    card: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
    dot: "bg-green-500",
    button: "text-green-600 dark:text-green-400 hover:bg-green-500/10",
  },
  emerald: {
    card: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    button: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
  },
  teal: {
    card: "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500",
    button: "text-teal-600 dark:text-teal-400 hover:bg-teal-500/10",
  },
  cyan: {
    card: "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    button: "text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10",
  },
  sky: {
    card: "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    button: "text-sky-600 dark:text-sky-400 hover:bg-sky-500/10",
  },
  blue: {
    card: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    button: "text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
  },
  indigo: {
    card: "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
    button: "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10",
  },
  violet: {
    card: "bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    button: "text-violet-600 dark:text-violet-400 hover:bg-violet-500/10",
  },
  purple: {
    card: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    button: "text-purple-600 dark:text-purple-400 hover:bg-purple-500/10",
  },
  fuchsia: {
    card: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300",
    dot: "bg-fuchsia-500",
    button: "text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-500/10",
  },
  pink: {
    card: "bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
    button: "text-pink-600 dark:text-pink-400 hover:bg-pink-500/10",
  },
  rose: {
    card: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    button: "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10",
  },
};

export const LIST_COLOR_OPTIONS = Object.keys(LIST_COLORS);

export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain;
  } catch {
    return url;
  }
}
