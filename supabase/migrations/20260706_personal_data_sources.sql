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
