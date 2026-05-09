import type { PlantType, SeedStatus } from "@/types";

export const plantAssetMap: Record<
  PlantType,
  Record<SeedStatus, string> & { label: string; color: string }
> = {
  crystal_bloom: {
    seed: "/plants/crystal_seed.svg",
    growing: "/plants/crystal_sprout.svg",
    blooming: "/plants/crystal_full.svg",
    label: "Crystal Bloom",
    color: "#6cefff",
  },
  nebula_flower: {
    seed: "/plants/nebula_seed.svg",
    growing: "/plants/nebula_sprout.svg",
    blooming: "/plants/nebula_full.svg",
    label: "Nebula Flower",
    color: "#9a6cff",
  },
  fire_lily: {
    seed: "/plants/fire_seed.svg",
    growing: "/plants/fire_sprout.svg",
    blooming: "/plants/fire_full.svg",
    label: "Fire Lily",
    color: "#ff7d26",
  },
  frost_orchid: {
    seed: "/plants/frost_seed.svg",
    growing: "/plants/frost_sprout.svg",
    blooming: "/plants/frost_full.svg",
    label: "Frost Orchid",
    color: "#c7f1ff",
  },
  aurora_blossom: {
    seed: "/plants/aurora_seed.svg",
    growing: "/plants/aurora_sprout.svg",
    blooming: "/plants/aurora_full.svg",
    label: "Aurora Blossom",
    color: "#34d399",
  },
  ember_dandelion: {
    seed: "/plants/ember_seed.svg",
    growing: "/plants/ember_sprout.svg",
    blooming: "/plants/ember_full.svg",
    label: "Ember Dandelion",
    color: "#fb923c",
  },
  moon_petal: {
    seed: "/plants/moon_seed.svg",
    growing: "/plants/moon_sprout.svg",
    blooming: "/plants/moon_full.svg",
    label: "Moon Petal",
    color: "#c4b5fd",
  },
  prism_flower: {
    seed: "/plants/prism_seed.svg",
    growing: "/plants/prism_sprout.svg",
    blooming: "/plants/prism_full.svg",
    label: "Prism Flower",
    color: "#f472b6",
  },
  thunder_lotus: {
    seed: "/plants/thunder_seed.svg",
    growing: "/plants/thunder_sprout.svg",
    blooming: "/plants/thunder_full.svg",
    label: "Thunder Lotus",
    color: "#60a5fa",
  },
  void_rose: {
    seed: "/plants/void_seed.svg",
    growing: "/plants/void_sprout.svg",
    blooming: "/plants/void_full.svg",
    label: "Void Rose",
    color: "#a855f7",
  },
} as const;

export const statusScale: Record<SeedStatus, number> = {
  seed: 0.42,
  growing: 0.58,
  blooming: 0.76,
};
