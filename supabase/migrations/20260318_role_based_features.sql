-- Role-Based Features Migration
-- Creates Watchlist (mentored_projects) and Quick Notes (project_notes) tables

CREATE TABLE IF NOT EXISTS mentored_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(teacher_id, project_id)
);

CREATE TABLE IF NOT EXISTS project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Optional depending on current project setup, but good practice)
-- ALTER TABLE mentored_projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- Creating basic policies (If RLS is enabled)
-- CREATE POLICY "Teachers can manage their mentored projects" ON mentored_projects
--    FOR ALL USING (auth.uid() = teacher_id);

-- CREATE POLICY "Teachers can manage their project notes" ON project_notes
--    FOR ALL USING (auth.uid() = teacher_id);
