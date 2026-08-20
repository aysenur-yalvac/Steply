const fs = require('fs');
let path = 'src/lib/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// Update ProjectTask
content = content.replace(
  /export type ProjectTask = \{\n\s*id: string;\n\s*project_id: string;\n\s*title: string;\n\s*is_completed: boolean;\n\s*created_at: string;\n\s*\};/,
  `export interface SubTask {\n  id: string;\n  title: string;\n  is_completed: boolean;\n}\n\nexport type ProjectTask = {\n  id: string;\n  project_id: string;\n  title: string;\n  description?: string;\n  is_completed: boolean;\n  due_date?: string | null;\n  assigned_to?: string | null;\n  subtasks?: SubTask[];\n  created_at: string;\n};`
);

// We need an updateTaskAction
const updateTaskCode = `
export async function updateTaskAction(
  taskId: string,
  projectId: string,
  updates: Partial<ProjectTask>
): Promise<{ success: true; task: ProjectTask } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };

  // Only allow updating safe fields
  const safeUpdates: any = {};
  if (updates.title !== undefined) safeUpdates.title = updates.title;
  if (updates.description !== undefined) safeUpdates.description = updates.description;
  if (updates.is_completed !== undefined) safeUpdates.is_completed = updates.is_completed;
  if (updates.due_date !== undefined) safeUpdates.due_date = updates.due_date;
  if (updates.assigned_to !== undefined) safeUpdates.assigned_to = updates.assigned_to;
  if (updates.subtasks !== undefined) safeUpdates.subtasks = updates.subtasks;

  const { data, error } = await ctx.admin
    .from('project_tasks')
    .update(safeUpdates)
    .eq('id', taskId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? 'Update failed' };

  revalidatePath(\`/dashboard/projects/\${projectId}\`);
  return { success: true, task: data as ProjectTask };
}
`;

// Insert the new action at the bottom before module ends, or just at the end
content += '\n' + updateTaskCode;

fs.writeFileSync(path, content, 'utf8');
console.log('Updated actions.ts');
