-- OAuth token vault — encrypted server-side credentials (never exposed to clients)

create table if not exists source_oauth_tokens (
  source_id text primary key,
  provider text not null,
  provider_account_id text not null,
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  token_type text not null default 'Bearer',
  scopes jsonb not null default '[]'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists source_oauth_tokens_provider_idx on source_oauth_tokens (provider, provider_account_id);
create index if not exists source_oauth_tokens_revoked_at_idx on source_oauth_tokens (revoked_at);
