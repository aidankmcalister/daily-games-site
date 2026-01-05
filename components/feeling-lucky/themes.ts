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
  puzzle: {
    border: "border-purple-500/50",
    shadow: "shadow-[0_0_50px_rgba(168,85,247,0.3)]",
    spinnerInit: "text-purple-500",
    spinnerText: "from-purple-400 to-pink-500",
    congratsText: "text-purple-500",
    winnerText: "from-purple-300 via-pink-400 to-purple-300",
    glow: "bg-purple-500/20",
    ring: "ring-purple-400",
    icon: "fill-purple-500",
    button:
      "from-purple-600 via-purple-500 to-purple-600 hover:from-purple-500 hover:to-purple-500 border-purple-800 shadow-purple-900/50",
    banner: "from-purple-600 to-purple-500",
    bannerPing: "bg-purple-600",
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
  entertainment: {
    border: "border-pink-500/50",
    shadow: "shadow-[0_0_50px_rgba(236,72,153,0.3)]",
    spinnerInit: "text-pink-500",
    spinnerText: "from-pink-400 to-rose-500",
    congratsText: "text-pink-500",
    winnerText: "from-pink-300 via-rose-400 to-pink-300",
    glow: "bg-pink-500/20",
    ring: "ring-pink-400",
    icon: "fill-pink-500",
    button:
      "from-pink-600 via-pink-500 to-pink-600 hover:from-pink-500 hover:to-pink-500 border-pink-800 shadow-pink-900/50",
    banner: "from-pink-600 to-pink-500",
    bannerPing: "bg-pink-600",
  },
  gaming: {
    border: "border-red-500/50",
    shadow: "shadow-[0_0_50px_rgba(239,68,68,0.3)]",
    spinnerInit: "text-red-500",
    spinnerText: "from-red-400 to-orange-500",
    congratsText: "text-red-500",
    winnerText: "from-red-300 via-orange-400 to-red-300",
    glow: "bg-red-500/20",
    ring: "ring-red-400",
    icon: "fill-red-500",
    button:
      "from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 border-red-800 shadow-red-900/50",
    banner: "from-red-600 to-red-500",
    bannerPing: "bg-red-600",
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
};
