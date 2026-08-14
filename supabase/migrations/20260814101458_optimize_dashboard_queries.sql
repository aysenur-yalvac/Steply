-- Optimize project queries
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

-- Optimize notes & mentors
CREATE INDEX IF NOT EXISTS idx_mentored_projects_teacher_id ON mentored_projects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
