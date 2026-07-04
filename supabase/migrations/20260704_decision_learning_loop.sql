-- Decision Learning Loop — lifecycle fields for memory_decisions
alter table memory_decisions
  add column if not exists status text,
  add column if not exists review_after timestamptz,
  add column if not exists review_completed_at timestamptz,
  add column if not exists lesson text,
  add column if not exists trajectory_effect text,
  add column if not exists confidence_before numeric(5, 4),
  add column if not exists confidence_after numeric(5, 4),
  add column if not exists recommendation text,
  add column if not exists next_action text,
  add column if not exists taken_at timestamptz;

create index if not exists memory_decisions_review_after_idx on memory_decisions (review_after);
create index if not exists memory_decisions_status_idx on memory_decisions (status);
