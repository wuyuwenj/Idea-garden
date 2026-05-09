// ── Enums ──

export type SeedStatus = "seed" | "growing" | "blooming";

export type SeedPriority = "urgent" | "high" | "medium" | "low";

export type PlantType =
  | "crystal_bloom"
  | "fire_lily"
  | "nebula_flower"
  | "frost_orchid"
  | "aurora_blossom"
  | "ember_dandelion"
  | "moon_petal"
  | "prism_flower"
  | "thunder_lotus"
  | "void_rose";

// ── Core Entity ──

export interface Seed {
  id: string;
  title: string;
  description: string;
  status: SeedStatus;
  priority: SeedPriority;
  plantType: PlantType;
  created_at: string;
  updated_at: string;
}
