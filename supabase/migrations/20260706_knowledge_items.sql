-- Knowledge Layer — structured knowledge from evidence

create table if not exists knowledge_items (
  id text primary key,
  owner text not null default 'giuseppe',
  source_id text not null,
  source_type text not null,
  knowledge_type text not null,
  label text not null,
  summary text not null default '',
  confidence double precision not null default 0,
  evidence_ids jsonb not null default '[]'::jsonb,
  evidence_urls jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  dedup_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_items_owner_idx on knowledge_items (owner, updated_at desc);
create index if not exists knowledge_items_source_idx on knowledge_items (source_id, updated_at desc);
