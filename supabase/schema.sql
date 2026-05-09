-- Idea Garden Schema

-- People
create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

-- Ideas
create table ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  status text not null default 'seed' check (status in ('seed', 'growing', 'mature', 'dormant', 'dead')),
  owner_id uuid references people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Assumptions
create table assumptions (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  text text not null,
  valid boolean, -- null = unvalidated
  created_at timestamptz not null default now()
);

-- Blockers
create table blockers (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  text text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Idea connections
create table idea_connections (
  id uuid primary key default gen_random_uuid(),
  from_idea_id uuid not null references ideas(id) on delete cascade,
  to_idea_id uuid not null references ideas(id) on delete cascade,
  type text not null default 'related' check (type in ('related', 'evolved_from', 'inspired_by', 'conflicts_with'))
);

-- Tickets
create table tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'done', 'canceled')),
  priority text not null default 'none' check (priority in ('urgent', 'high', 'medium', 'low', 'none')),
  assignee_id uuid references people(id),
  idea_id uuid references ideas(id),
  parent_ticket_id uuid references tickets(id),
  agent_brief text,
  labels text[] not null default '{}',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Events
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  type text not null default 'custom' check (type in ('market_change', 'customer_feedback', 'cost_change', 'team_change', 'custom')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Event <-> Idea links
create table event_idea_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  idea_id uuid not null references ideas(id) on delete cascade,
  revived boolean not null default false
);

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  url text,
  type text not null default 'doc' check (type in ('brainstorm', 'doc', 'feedback', 'research')),
  created_at timestamptz not null default now()
);

-- Document <-> Idea links
create table document_idea_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  idea_id uuid not null references ideas(id) on delete cascade
);

-- Indexes
create index idx_ideas_status on ideas(status);
create index idx_tickets_status on tickets(status);
create index idx_tickets_idea_id on tickets(idea_id);
create index idx_assumptions_idea_id on assumptions(idea_id);
create index idx_blockers_idea_id on blockers(idea_id);
create index idx_event_idea_links_event_id on event_idea_links(event_id);
create index idx_event_idea_links_idea_id on event_idea_links(idea_id);
