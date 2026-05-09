// ── Enums ──

export type IssueStatus =
  | "seed"      // raw idea / backlog
  | "sprout"    // context found / validated
  | "flower"    // in progress
  | "fruit"     // shipped / done
  | "compost";  // paused / rejected / failed, but preserved

export type Priority = "urgent" | "high" | "medium" | "low";

export type IssueTag = "bug" | "feature" | "idea" | "research" | "decision";

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

// ── Supporting Types ──

export type ContextSourceType =
  | "doc"
  | "slack"
  | "github"
  | "file"
  | "customer"
  | "research";

export type ContextRoot = {
  title: string;
  sourceType: ContextSourceType;
  summary: string;
  relevance: string;
};

// ── Core Entity ──

export type GardenIssue = {
  id: string;

  // Basic issue tracker fields
  title: string;
  description: string;
  priority: Priority;
  status: IssueStatus;
  tags: IssueTag[];

  // Garden-specific fields
  plantType: PlantType;
  blockers: string[];
  relatedIssueIds: string[];
  isRevived: boolean;

  // Nia/context fields
  niaContextId?: string;
  contextRoots: ContextRoot[];

  // AI-generated execution fields
  suggestedTickets: string[];
  agentBrief?: string;

  // Metadata
  createdAt: number;
  updatedAt: number;
};
