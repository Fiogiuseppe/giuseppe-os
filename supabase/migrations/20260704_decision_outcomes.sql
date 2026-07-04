-- Optional decision outcomes for Future-Self Oracle evidence
alter table memory_decisions
  add column if not exists outcome text,
  add column if not exists outcome_rating integer;
