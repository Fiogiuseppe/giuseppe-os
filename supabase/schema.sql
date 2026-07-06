-- Giuseppe OS — persistent memory foundation
-- Run in Supabase SQL editor. Identity/brain JSON remains curated until Identity Layer v2.

create table if not exists memory_sessions (
  id text primary key,
  intent text not null,
  summary text not null,
  query text,
  created_at timestamptz not null default now()
);

create table if not exists memory_records (
  id text primary key,
  type text not null,
  content text not null,
  confidence numeric(4, 3) not null default 0.5,
  source text not null default 'interaction',
  session_id text references memory_sessions(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists memory_decisions (
  id text primary key,
  decision text not null,
  reason text,
  category text,
  status text,
  recommendation text,
  next_action text,
  taken_at timestamptz,
  review_after timestamptz,
  review_completed_at timestamptz,
  outcome text,
  outcome_rating integer,
  lesson text,
  trajectory_effect text,
  confidence_before numeric(5, 4),
  confidence_after numeric(5, 4),
  created_at timestamptz not null default now()
);

create table if not exists memory_lessons (
  id text primary key,
  lesson text not null,
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists memory_patterns (
  id text primary key,
  pattern text not null,
  created_at timestamptz not null default now()
);

create table if not exists memory_insights (
  id text primary key,
  insight_id text not null,
  insight text not null,
  signal_type text not null,
  evidence_score integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists memory_sessions_created_at_idx on memory_sessions (created_at desc);
create index if not exists memory_decisions_created_at_idx on memory_decisions (created_at desc);
create index if not exists memory_decisions_review_after_idx on memory_decisions (review_after);
create index if not exists memory_decisions_status_idx on memory_decisions (status);
create index if not exists memory_insights_created_at_idx on memory_insights (created_at desc);

create table if not exists memory_self_model (
  id text primary key,
  version text not null,
  dimensions jsonb not null,
  patterns jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists memory_self_model_updated_at_idx on memory_self_model (updated_at desc);

-- Personal Data Sources — read-only ingestion foundation

create table if not exists data_sources (
  id text primary key,
  source text not null,
  account text not null,
  label text not null,
  auth_status text not null default 'needs_auth',
  read_only boolean not null default true,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  unique (source, account)
);

create table if not exists raw_source_items (
  id text primary key,
  source text not null,
  account text not null,
  external_id text not null,
  raw_json jsonb not null,
  fetched_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (source, account, external_id)
);

create table if not exists normalized_source_items (
  id text primary key,
  raw_item_id text not null references raw_source_items(id) on delete cascade,
  source text not null,
  account text not null,
  external_id text not null,
  content text not null default '',
  caption text,
  media_urls jsonb not null default '[]'::jsonb,
  published_at timestamptz not null,
  permalink text not null default '',
  metrics jsonb,
  kind text not null default 'unknown',
  created_at timestamptz not null default now(),
  unique (source, account, external_id)
);

create table if not exists evidence_items (
  id text primary key,
  normalized_item_id text not null references normalized_source_items(id) on delete cascade,
  source text not null,
  account text not null,
  attribution text not null,
  summary text not null,
  dimension_hints jsonb not null default '[]'::jsonb,
  confidence text not null default 'low',
  trace_id text not null,
  published_at timestamptz not null,
  permalink text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists data_sources_source_account_idx on data_sources (source, account);
create index if not exists raw_source_items_source_account_idx on raw_source_items (source, account);
create index if not exists raw_source_items_published_lookup_idx on raw_source_items (created_at desc);
create index if not exists normalized_source_items_published_at_idx on normalized_source_items (published_at desc);
create index if not exists evidence_items_source_account_idx on evidence_items (source, account);
create index if not exists evidence_items_published_at_idx on evidence_items (published_at desc);
create index if not exists evidence_items_trace_id_idx on evidence_items (trace_id);
