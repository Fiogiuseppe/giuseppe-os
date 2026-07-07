-- Weekly Letter — one generated letter per ISO week, email sent at most once

create table if not exists weekly_letters (
  week_key text primary key,
  week_number integer not null,
  date_range text not null,
  week_label text not null,
  locale text not null default 'en',
  content jsonb not null,
  evidence jsonb not null,
  source text not null,
  thin_evidence boolean not null default false,
  html_body text,
  generated_at timestamptz not null default now(),
  email_sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists weekly_letters_generated_at_idx on weekly_letters (generated_at desc);
