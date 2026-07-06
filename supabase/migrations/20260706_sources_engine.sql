-- Sources Engine — connection state and sync run logs (server-side only)

create table if not exists source_connections (
  source_id text primary key,
  connection_status text not null default 'disconnected',
  health_status text not null default 'unknown',
  last_sync_at timestamptz,
  permissions_granted jsonb not null default '[]'::jsonb,
  data_collection_enabled jsonb not null default '[]'::jsonb,
  health_note text,
  sync_cursor text,
  connected_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists source_sync_runs (
  id text primary key,
  source_id text not null references source_connections(source_id) on delete cascade,
  mode text not null,
  status text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  fetched integer not null default 0,
  normalized integer not null default 0,
  evidence integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists source_sync_runs_source_id_idx on source_sync_runs (source_id, finished_at desc);
