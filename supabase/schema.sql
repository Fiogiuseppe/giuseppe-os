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
create index if not exists memory_insights_created_at_idx on memory_insights (created_at desc);
