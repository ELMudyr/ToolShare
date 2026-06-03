export interface ItemVisual {
  gradient: string;
  bgLight: string;
  iconColor: string;
  category: string;
}

const CATEGORY_MAP: Array<{ keywords: string[]; visual: ItemVisual }> = [
  {
    keywords: [
      "drill",
      "screwdriver",
      "wrench",
      "hammer",
      "nail",
      "screw",
      "bolt",
    ],
    visual: {
      gradient: "from-orange-400 to-amber-500",
      bgLight: "bg-orange-50",
      iconColor: "text-orange-500",
      category: "Power Tool",
    },
  },
  {
    keywords: ["sander", "grinder", "saw", "cutter", "jigsaw", "circular"],
    visual: {
      gradient: "from-red-400 to-rose-500",
      bgLight: "bg-red-50",
      iconColor: "text-red-500",
      category: "Power Tool",
    },
  },
  {
    keywords: ["ladder", "scaffold", "step"],
    visual: {
      gradient: "from-sky-400 to-blue-500",
      bgLight: "bg-sky-50",
      iconColor: "text-sky-500",
      category: "Climbing",
    },
  },
  {
    keywords: ["extension", "cable", "reel", "cord", "plug", "socket", "wire"],
    visual: {
      gradient: "from-emerald-400 to-green-500",
      bgLight: "bg-emerald-50",
      iconColor: "text-emerald-500",
      category: "Electrical",
    },
  },
  {
    keywords: ["game", "board", "puzzle", "chess", "card", "monopoly", "toy"],
    visual: {
      gradient: "from-purple-400 to-violet-500",
      bgLight: "bg-purple-50",
      iconColor: "text-purple-500",
      category: "Leisure",
    },
  },
  {
    keywords: ["bike", "bicycle", "pump", "tyre", "wheel"],
    visual: {
      gradient: "from-cyan-400 to-teal-500",
      bgLight: "bg-cyan-50",
      iconColor: "text-cyan-500",
      category: "Cycling",
    },
  },
  {
    keywords: ["paint", "brush", "roller", "spray", "varnish", "primer"],
    visual: {
      gradient: "from-pink-400 to-fuchsia-500",
      bgLight: "bg-pink-50",
      iconColor: "text-pink-500",
      category: "Painting",
    },
  },
  {
    keywords: ["vacuum", "cleaner", "mop", "broom", "hoover"],
    visual: {
      gradient: "from-indigo-400 to-blue-500",
      bgLight: "bg-indigo-50",
      iconColor: "text-indigo-500",
      category: "Cleaning",
    },
  },
  {
    keywords: ["tent", "camping", "sleeping", "bag", "lantern"],
    visual: {
      gradient: "from-lime-400 to-green-500",
      bgLight: "bg-lime-50",
      iconColor: "text-lime-600",
      category: "Outdoor",
    },
  },
];

const DEFAULT_VISUAL: ItemVisual = {
  gradient: "from-slate-400 to-gray-500",
  bgLight: "bg-slate-50",
  iconColor: "text-slate-500",
  category: "Other",
};

export function getItemVisual(name: string): ItemVisual {
  const lower = name.toLowerCase();
  for (const entry of CATEGORY_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.visual;
    }
  }
  return DEFAULT_VISUAL;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
