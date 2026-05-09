export const gardenTheme = {
  parchment: "#efe7d4",
  parchmentLight: "#f8f1df",
  parchmentWarm: "#fff7df",
  parchmentGold: "#efe0b8",

  woodDark: "#5a3b24",
  woodMid: "#8a5a34",
  woodLight: "#b87942",

  soilDark: "#5b3d27",
  soilMid: "#7a5334",
  soilLight: "#a3734f",

  grassDark: "#3f6a2f",
  grassMid: "#5d8d43",
  grassLight: "#86b75f",
  grassHighlight: "#b9d97f",

  waterDark: "#2f6f9f",
  waterMid: "#5bb6d6",
  waterLight: "#b9f0ff",

  ink: "#28311f",
  inkLight: "#2f2417",
  inkMuted: "#6d4a2c",
  inkSubtle: "#6f7d5d",

  headerBg: "#d9b978",

  priority: {
    urgent: "#d64b35",
    high: "#e38a2e",
    medium: "#d7b945",
    low: "#6fa85b",
  },

  flower: {
    crystal_bloom: "#6cefff",
    nebula_flower: "#9a6cff",
    fire_lily: "#ff7d26",
    frost_orchid: "#c7f1ff",
    aurora_blossom: "#34d399",
    ember_dandelion: "#fb923c",
    moon_petal: "#c4b5fd",
    prism_flower: "#f472b6",
    thunder_lotus: "#60a5fa",
    void_rose: "#a855f7",
  },

  status: {
    seed: { bg: "#efe0b8", label: "Seed", iconName: "sprout" as const, subtitle: "newly planted" },
    growing: { bg: "#dce8b4", label: "Growing", iconName: "leaf" as const, subtitle: "taking root" },
    blooming: { bg: "#ead7f5", label: "Blooming", iconName: "flower" as const, subtitle: "ready to harvest" },
  },
} as const;
