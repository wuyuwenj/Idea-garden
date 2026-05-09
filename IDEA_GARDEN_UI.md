# Idea Garden — Structure & Data Reference

Use this to redesign the UI from scratch. Contains only data model, state, seed data, and component structure — no styling.

---

## Product Concept

**Idea Garden** is a 3D team memory tool that captures brainstorms, failed ideas, and decisions, connects them into a shared knowledge graph, and turns revived opportunities into tickets and agent-ready briefs.

### Visual Metaphor
- **Seeds** = raw, unvalidated ideas
- **Sprouts** = ideas being developed
- **Trees** = mature, shipped projects
- **Dormant plants** = stalled ideas (gray, faded)
- **Dead branches** = failed assumptions

### Key Screens
1. **3D Garden View** — interactive 3D scene with idea nodes as plants, connections as paths between them
2. **Board View** — Linear-style Kanban board for tickets (backlog → todo → in progress → done → canceled)
3. **Idea Detail Panel** — slide-out sidebar showing: summary, assumptions (validated/invalidated), blockers (resolved/unresolved), connected ideas, linked tickets, "Generate Tickets with AI" button
4. **Ask Box** — search bar: "Have we discussed AI onboarding before?" → highlights matching ideas in the garden
5. **Event Input** — dialog to add external triggers (e.g. "API costs dropped 70%") → automatically revives matching dormant ideas
6. **Header** — app name, Garden/Board tab switcher, search, add event button

### Key Interactions
- Hover idea node in 3D → shows title + status tooltip
- Click idea node → detail panel slides open from right
- Add event → dormant ideas that match keywords glow and change status to "growing"
- Search → matching ideas highlight in the garden
- Generate tickets → AI creates 3 tickets with agent briefs from an idea

### Design Goals
- Dark theme, premium dev tool aesthetic
- Should feel like Linear meets a living ecosystem
- Violet/purple accent color
- Glass morphism welcome but not required

---

## Data Model

```ts
type IdeaStatus = "seed" | "growing" | "mature" | "dormant" | "dead"
type TicketStatus = "backlog" | "todo" | "in_progress" | "done" | "canceled"
type TicketPriority = "urgent" | "high" | "medium" | "low" | "none"
type EventType = "market_change" | "customer_feedback" | "cost_change" | "team_change" | "custom"
type ConnectionType = "related" | "evolved_from" | "inspired_by" | "conflicts_with"

interface Person {
  id: string
  name: string
  role: string
}

interface Idea {
  id: string
  title: string
  summary: string
  status: IdeaStatus
  owner_id: string | null
  assumptions: { id: string; text: string; valid: boolean | null }[]
  blockers: { id: string; text: string; resolved: boolean }[]
}

interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  assignee_id: string | null
  idea_id: string | null       // which idea generated this ticket
  agent_brief: string | null    // context for AI agents
  labels: string[]
  due_date: string | null
}

interface Event {
  id: string
  title: string
  description: string
  type: EventType
  date: string
}

interface IdeaConnection {
  id: string
  from_idea_id: string
  to_idea_id: string
  type: ConnectionType
}
```

---

## Sample Data

### People
| ID | Name | Role |
|----|------|------|
| p1 | Alex Chen | Engineering Lead |
| p2 | Mara Johnson | Product Manager |
| p3 | Dev Patel | ML Engineer |
| p4 | Sofia Ruiz | Designer |

### Ideas
| ID | Title | Status | Owner |
|----|-------|--------|-------|
| i1 | AI Onboarding Assistant | dormant | Dev Patel |
| i2 | Smart Search with Semantic Understanding | growing | Alex Chen |
| i3 | Customer Feedback Loop Automation | mature | Mara Johnson |
| i4 | Multiplayer Workspace Editing | seed | — |
| i5 | Automated Changelog Generation | dead | Alex Chen |
| i6 | Usage-Based Pricing Tier | dormant | Mara Johnson |
| i7 | Internal Knowledge Base Agent | growing | Dev Patel |
| i8 | Custom Dashboard Builder | seed | Sofia Ruiz |

**i1 (AI Onboarding Assistant) details:**
- Assumptions:
  - ✓ Users prefer guided setup over documentation (validated)
  - ✗ LLM costs are too high for per-user onboarding (invalidated)
- Blockers:
  - ✓ Model API costs were $0.12/conversation (resolved)
  - ✓ Support docs were outdated (resolved)

**i5 (Automated Changelog Generation) details:**
- Blockers:
  - ✗ Commit messages too inconsistent (unresolved)

### Connections
| From | To | Type |
|------|----|------|
| AI Onboarding | Knowledge Base Agent | related |
| Smart Search | Knowledge Base Agent | inspired_by |
| AI Onboarding | Feedback Loop | related |
| Multiplayer Workspace | Dashboard Builder | related |
| Changelog Generation | Feedback Loop | evolved_from |
| Usage-Based Pricing | AI Onboarding | related |

### Events
| Title | Type | Date |
|-------|------|------|
| API costs dropped 70% | cost_change | 2026-04-20 |
| 3 customers requested AI onboarding this week | customer_feedback | 2026-05-05 |
| Support docs fully rewritten | team_change | 2026-04-01 |
| Competitor launched AI search | market_change | 2026-04-15 |

### Tickets
| Title | Status | Priority | Idea | Assignee |
|-------|--------|----------|------|----------|
| Build onboarding Q&A prototype | todo | high | AI Onboarding | Dev Patel |
| Add hallucination evaluation suite | backlog | high | AI Onboarding | Dev Patel |
| Connect support docs as retrieval source | in_progress | medium | AI Onboarding | Alex Chen |
| Design onboarding conversation UI | todo | medium | AI Onboarding | Sofia Ruiz |
| Implement semantic search MVP | in_progress | urgent | Smart Search | Alex Chen |
| Set up feedback tagging pipeline | done | medium | Feedback Loop | Mara Johnson |

---

## Demo Story

The "wow moment" for a hackathon judge:

1. Judge sees the 3D garden — dormant ideas are gray, active ones are green/blue
2. User adds event: "API costs dropped 70%"
3. The "AI Onboarding Assistant" (dormant) glows and revives to "growing"
4. User clicks it → detail panel shows: old assumptions (now invalidated), blockers (now resolved), why it was abandoned, what changed
5. User clicks "Generate Tickets with AI" → 3 implementation tickets appear with full agent briefs
6. Switch to Board view → tickets are in the Kanban, ready to assign

**The pitch:** A forgotten idea becomes relevant again, and the team turns it into tickets with full context.

---

## Tech Stack
- Next.js 16 (App Router)
- React Three Fiber + drei (3D)
- Tailwind CSS v4 + shadcn/ui
- Zustand (state)
- Claude API (ticket generation)
