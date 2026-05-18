-- blocks: user blocking system
create table if not exists blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (blocker_id, blocked_id)
);

create index if not exists blocks_blocker_idx on blocks (blocker_id);
create index if not exists blocks_blocked_idx on blocks (blocked_id);
