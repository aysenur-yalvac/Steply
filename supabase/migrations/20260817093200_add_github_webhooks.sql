
CREATE TABLE IF NOT EXISTS project_github_repos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  repo_url text NOT NULL,
  repo_owner text NOT NULL,
  repo_name text NOT NULL,
  webhook_secret text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_github_repos_project_id ON project_github_repos(project_id);

CREATE TABLE IF NOT EXISTS project_commits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  commit_hash text NOT NULL,
  commit_message text NOT NULL,
  author_name text NOT NULL,
  author_avatar text,
  commit_url text NOT NULL,
  pushed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_commits_project_id ON project_commits(project_id);
