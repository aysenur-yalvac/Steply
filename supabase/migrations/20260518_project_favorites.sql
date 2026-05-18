-- project_favorites: heart/like system for projects (independent of watchlist)
create table if not exists project_favorites (
  user_id    uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, project_id)
);

create index if not exists proj_fav_user_idx    on project_favorites (user_id);
create index if not exists proj_fav_project_idx on project_favorites (project_id);
