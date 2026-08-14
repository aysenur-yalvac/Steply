const fs = require('fs');

const migration = `-- Optimize project queries
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

-- Optimize notes & mentors
CREATE INDEX IF NOT EXISTS idx_mentored_projects_teacher_id ON mentored_projects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
`;

const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
const filename = `supabase/migrations/${timestamp}_optimize_dashboard_queries.sql`;

fs.writeFileSync(filename, migration, 'utf8');
console.log('Created migration:', filename);
