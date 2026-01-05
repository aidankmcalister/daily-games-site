export const TOPIC_CONFETTI_COLORS: Record<string, string[]> = {
  words: ["#3b82f6", "#2563eb", "#60a5fa"],
  puzzle: ["#a855f7", "#9333ea", "#c084fc"],
  geography: ["#22c55e", "#16a34a", "#4ade80"],
  trivia: ["#eab308", "#ca8a04", "#facc15"],
  entertainment: ["#ec4899", "#db2777", "#f472b6"],
  gaming: ["#ef4444", "#dc2626", "#f87171"],
  nature: ["#10b981", "#059669", "#34d399"],
  food: ["#f97316", "#ea580c", "#fb923c"],
  sports: ["#06b6d4", "#0891b2", "#22d3ee"],
};

export type ThemeColors = {
  border: string;
  shadow: string;
  spinnerInit: string;
  spinnerText: string;
  congratsText: string;
  winnerText: string;
  glow: string;
  ring: string;
  icon: string;
  button: string;
  banner: string;
  bannerPing: string;
};

export const TOPIC_THEMES: Record<string, ThemeColors> = {
  words: {
    border: "border-blue-500/50",
    shadow: "shadow-[0_0_50px_rgba(59,130,246,0.3)]",
    spinnerInit: "text-blue-500",
    spinnerText: "from-blue-400 to-cyan-500",
    congratsText: "text-blue-500",
    winnerText: "from-blue-300 via-cyan-400 to-blue-300",
    glow: "bg-blue-500/20",
    ring: "ring-blue-400",
    icon: "fill-blue-500",
    button:
      "from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-500 border-blue-800 shadow-blue-900/50",
    banner: "from-blue-600 to-blue-500",
    bannerPing: "bg-blue-600",
  },
  geography: {
    border: "border-green-500/50",
    shadow: "shadow-[0_0_50px_rgba(34,197,94,0.3)]",
    spinnerInit: "text-green-500",
    spinnerText: "from-green-400 to-emerald-500",
    congratsText: "text-green-500",
    winnerText: "from-green-300 via-emerald-400 to-green-300",
    glow: "bg-green-500/20",
    ring: "ring-green-400",
    icon: "fill-green-500",
    button:
      "from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:to-green-500 border-green-800 shadow-green-900/50",
    banner: "from-green-600 to-green-500",
    bannerPing: "bg-green-600",
  },
  trivia: {
    border: "border-yellow-500/50",
    shadow: "shadow-[0_0_50px_rgba(234,179,8,0.3)]",
    spinnerInit: "text-yellow-500",
    spinnerText: "from-yellow-400 to-orange-500",
    congratsText: "text-yellow-500",
    winnerText: "from-yellow-300 via-orange-400 to-yellow-300",
    glow: "bg-yellow-500/20",
    ring: "ring-yellow-400",
    icon: "fill-yellow-500",
    button:
      "from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-500 border-yellow-800 shadow-yellow-900/50",
    banner: "from-yellow-600 to-yellow-500",
    bannerPing: "bg-yellow-600",
  },
  nature: {
    border: "border-emerald-500/50",
    shadow: "shadow-[0_0_50px_rgba(16,185,129,0.3)]",
    spinnerInit: "text-emerald-500",
    spinnerText: "from-emerald-400 to-teal-500",
    congratsText: "text-emerald-500",
    winnerText: "from-emerald-300 via-teal-400 to-emerald-300",
    glow: "bg-emerald-500/20",
    ring: "ring-emerald-400",
    icon: "fill-emerald-500",
    button:
      "from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 border-emerald-800 shadow-emerald-900/50",
    banner: "from-emerald-600 to-emerald-500",
    bannerPing: "bg-emerald-600",
  },
  food: {
    border: "border-orange-500/50",
    shadow: "shadow-[0_0_50px_rgba(249,115,22,0.3)]",
    spinnerInit: "text-orange-500",
    spinnerText: "from-orange-400 to-yellow-500",
    congratsText: "text-orange-500",
    winnerText: "from-orange-300 via-yellow-400 to-orange-300",
    glow: "bg-orange-500/20",
    ring: "ring-orange-400",
    icon: "fill-orange-500",
    button:
      "from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-500 border-orange-800 shadow-orange-900/50",
    banner: "from-orange-600 to-orange-500",
    bannerPing: "bg-orange-600",
  },
  sports: {
    border: "border-cyan-500/50",
    shadow: "shadow-[0_0_50px_rgba(6,182,212,0.3)]",
    spinnerInit: "text-cyan-500",
    spinnerText: "from-cyan-400 to-blue-500",
    congratsText: "text-cyan-500",
    winnerText: "from-cyan-300 via-blue-400 to-cyan-300",
    glow: "bg-cyan-500/20",
    ring: "ring-cyan-400",
    icon: "fill-cyan-500",
    button:
      "from-cyan-600 via-cyan-500 to-cyan-600 hover:from-cyan-500 hover:to-cyan-500 border-cyan-800 shadow-cyan-900/50",
    banner: "from-cyan-600 to-cyan-500",
    bannerPing: "bg-cyan-600",
  },
  // New Topics
  colors: {
    border: "border-indigo-500/50",
    shadow: "shadow-[0_0_50px_rgba(99,102,241,0.3)]",
    spinnerInit: "text-indigo-500",
    spinnerText: "from-indigo-400 to-violet-500",
    congratsText: "text-indigo-500",
    winnerText: "from-indigo-300 via-violet-400 to-indigo-300",
    glow: "bg-indigo-500/20",
    ring: "ring-indigo-400",
    icon: "fill-indigo-500",
    button:
      "from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 border-indigo-800 shadow-indigo-900/50",
    banner: "from-indigo-600 to-indigo-500",
    bannerPing: "bg-indigo-600",
  },
  estimation: {
    border: "border-teal-500/50",
    shadow: "shadow-[0_0_50px_rgba(20,184,166,0.3)]",
    spinnerInit: "text-teal-500",
    spinnerText: "from-teal-400 to-green-500",
    congratsText: "text-teal-500",
    winnerText: "from-teal-300 via-green-400 to-teal-300",
    glow: "bg-teal-500/20",
    ring: "ring-teal-400",
    icon: "fill-teal-500",
    button:
      "from-teal-600 via-teal-500 to-teal-600 hover:from-teal-500 hover:to-teal-500 border-teal-800 shadow-teal-900/50",
    banner: "from-teal-600 to-teal-500",
    bannerPing: "bg-teal-600",
  },
  logic: {
    border: "border-slate-500/50",
    shadow: "shadow-[0_0_50px_rgba(100,116,139,0.3)]",
    spinnerInit: "text-slate-500",
    spinnerText: "from-slate-400 to-gray-500",
    congratsText: "text-slate-500",
    winnerText: "from-slate-300 via-gray-400 to-slate-300",
    glow: "bg-slate-500/20",
    ring: "ring-slate-400",
    icon: "fill-slate-500",
    button:
      "from-slate-600 via-slate-500 to-slate-600 hover:from-slate-500 hover:to-slate-500 border-slate-800 shadow-slate-900/50",
    banner: "from-slate-600 to-slate-500",
    bannerPing: "bg-slate-600",
  },
  history: {
    border: "border-amber-500/50",
    shadow: "shadow-[0_0_50px_rgba(245,158,11,0.3)]",
    spinnerInit: "text-amber-500",
    spinnerText: "from-amber-400 to-orange-500",
    congratsText: "text-amber-500",
    winnerText: "from-amber-300 via-orange-400 to-amber-300",
    glow: "bg-amber-500/20",
    ring: "ring-amber-400",
    icon: "fill-amber-500",
    button:
      "from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 border-amber-800 shadow-amber-900/50",
    banner: "from-amber-600 to-amber-500",
    bannerPing: "bg-amber-600",
  },
  movies_tv: {
    border: "border-violet-500/50",
    shadow: "shadow-[0_0_50px_rgba(139,92,246,0.3)]",
    spinnerInit: "text-violet-500",
    spinnerText: "from-violet-400 to-purple-500",
    congratsText: "text-violet-500",
    winnerText: "from-violet-300 via-purple-400 to-violet-300",
    glow: "bg-violet-500/20",
    ring: "ring-violet-400",
    icon: "fill-violet-500",
    button:
      "from-violet-600 via-violet-500 to-violet-600 hover:from-violet-500 hover:to-violet-500 border-violet-800 shadow-violet-900/50",
    banner: "from-violet-600 to-violet-500",
    bannerPing: "bg-violet-600",
  },
  music: {
    border: "border-rose-500/50",
    shadow: "shadow-[0_0_50px_rgba(244,63,94,0.3)]",
    spinnerInit: "text-rose-500",
    spinnerText: "from-rose-400 to-pink-500",
    congratsText: "text-rose-500",
    winnerText: "from-rose-300 via-pink-400 to-rose-300",
    glow: "bg-rose-500/20",
    ring: "ring-rose-400",
    icon: "fill-rose-500",
    button:
      "from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-500 border-rose-800 shadow-rose-900/50",
    banner: "from-rose-600 to-rose-500",
    bannerPing: "bg-rose-600",
  },
  shapes: {
    border: "border-lime-500/50",
    shadow: "shadow-[0_0_50px_rgba(132,204,22,0.3)]",
    spinnerInit: "text-lime-500",
    spinnerText: "from-lime-400 to-green-500",
    congratsText: "text-lime-500",
    winnerText: "from-lime-300 via-green-400 to-lime-300",
    glow: "bg-lime-500/20",
    ring: "ring-lime-400",
    icon: "fill-lime-500",
    button:
      "from-lime-600 via-lime-500 to-lime-600 hover:from-lime-500 hover:to-lime-500 border-lime-800 shadow-lime-900/50",
    banner: "from-lime-600 to-lime-500",
    bannerPing: "bg-lime-600",
  },
  video_games: {
    border: "border-sky-500/50",
    shadow: "shadow-[0_0_50px_rgba(14,165,233,0.3)]",
    spinnerInit: "text-sky-500",
    spinnerText: "from-sky-400 to-blue-500",
    congratsText: "text-sky-500",
    winnerText: "from-sky-300 via-blue-400 to-sky-300",
    glow: "bg-sky-500/20",
    ring: "ring-sky-400",
    icon: "fill-sky-500",
    button:
      "from-sky-600 via-sky-500 to-sky-600 hover:from-sky-500 hover:to-sky-500 border-sky-800 shadow-sky-900/50",
    banner: "from-sky-600 to-sky-500",
    bannerPing: "bg-sky-600",
  },
  board_games: {
    border: "border-fuchsia-500/50",
    shadow: "shadow-[0_0_50px_rgba(217,70,239,0.3)]",
    spinnerInit: "text-fuchsia-500",
    spinnerText: "from-fuchsia-400 to-pink-500",
    congratsText: "text-fuchsia-500",
    winnerText: "from-fuchsia-300 via-pink-400 to-fuchsia-300",
    glow: "bg-fuchsia-500/20",
    ring: "ring-fuchsia-400",
    icon: "fill-fuchsia-500",
    button:
      "from-fuchsia-600 via-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-500 hover:to-fuchsia-500 border-fuchsia-800 shadow-fuchsia-900/50",
    banner: "from-fuchsia-600 to-fuchsia-500",
    bannerPing: "bg-fuchsia-600",
  },
};
