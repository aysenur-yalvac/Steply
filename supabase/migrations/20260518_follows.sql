-- follows: Instagram-style mutual follow system
create table if not exists follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz default now() not null,
  primary key (follower_id, following_id)
);

create index if not exists follows_follower_idx  on follows (follower_id);
create index if not exists follows_following_idx on follows (following_id);

alter table follows enable row level security;

-- Everyone can see follow relationships (public social graph)
create policy "follows_select_all"
  on follows for select using (true);

-- Only the follower can create their own follow rows
create policy "follows_insert_own"
  on follows for insert
  with check (auth.uid() = follower_id);

-- Only the follower can remove their own follow rows
create policy "follows_delete_own"
  on follows for delete
  using (auth.uid() = follower_id);
