// ── Enums ──

export type SeedStatus = "seed" | "sprout" | "flower" | "compost";

export type SeedPriority = "urgent" | "high" | "medium" | "low";

export type SeedTag = "bug" | "feature" | "idea" | "research" | "decision";

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

export type ContextSourceType =
  | "doc"
  | "slack"
  | "github"
  | "file"
  | "customer"
  | "research";

// ── Supporting Types ──

export interface ContextRoot {
  title: string;
  sourceType: ContextSourceType;
  summary: string;
  relevance: string;
}

// ── Project ──

export interface Project {
  id: string;
  team_id: string;
  name: string;
  slug: string;
  nia_vault_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ── Core Entity ──

export interface Seed {
  id: string;
  team_id: string;
  project_id?: string;
  title: string;
  description: string;
  status: SeedStatus;
  priority: SeedPriority;
  tags: SeedTag[];
  plant_type: PlantType;
  created_by: string;

  nia_context_id?: string;
  context_roots: ContextRoot[];

  blockers: string[];
  related_issue_ids: string[];
  is_revived: boolean;

  suggested_tickets: string[];
  agent_brief?: string;

  created_at: string;
  updated_at: string;
}
