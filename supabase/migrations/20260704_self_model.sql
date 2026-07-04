-- Self Model v1 — evidence-backed dimension tracking

create table if not exists memory_self_model (
  id text primary key,
  version text not null,
  dimensions jsonb not null,
  patterns jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists memory_self_model_updated_at_idx on memory_self_model (updated_at desc);
