const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldStr = `  const { data, error } = await ctx.admin
    .from('project_tasks')
    .update(safeUpdates)
    .eq('id', taskId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? 'Update failed' };

  revalidatePath(\`/dashboard/projects/\${projectId}\`);
  return { success: true, task: data as ProjectTask };
}`;

const newStr = `  const { data: existingTask } = await ctx.admin.from('project_tasks').select('*').eq('id', taskId).single();

  const { data, error } = await ctx.admin
    .from('project_tasks')
    .update(safeUpdates)
    .eq('id', taskId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? 'Update failed' };

  // --- Notifications Logic ---
  if (existingTask) {
    const title = data.title || 'Bir gorev';
    // Notification: Task assigned
    if (data.assigned_to && data.assigned_to !== existingTask.assigned_to && data.assigned_to !== ctx.user.id) {
      // Find assigner's name
      const { data: assigner } = await ctx.admin.from('profiles').select('full_name').eq('id', ctx.user.id).single();
      const assignerName = assigner?.full_name || 'Bir kullanici';
      await createNotificationAction(
        data.assigned_to,
        'task',
        'Yeni Gorev Atandi',
        \`\${assignerName} sana "\${title}" gorevini atadi.\`,
        projectId
      );
    }
    // Notification: Task completed
    if (data.is_completed === true && existingTask.is_completed === false) {
      const { data: proj } = await ctx.admin.from('projects').select('student_id').eq('id', projectId).single();
      const ownerId = proj?.student_id;
      const { data: completer } = await ctx.admin.from('profiles').select('full_name').eq('id', ctx.user.id).single();
      const completerName = completer?.full_name || 'Bir kullanici';
      
      if (ownerId && ownerId !== ctx.user.id) {
        await createNotificationAction(
          ownerId,
          'task',
          'Gorev Tamamlandi',
          \`\${completerName} "\${title}" gorevini tamamladi.\`,
          projectId
        );
      }
    }
  }
  // ---------------------------

  revalidatePath(\`/dashboard/projects/\${projectId}\`);
  return { success: true, task: data as ProjectTask };
}`;

actions = actions.replace(oldStr, newStr);
fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Patched actions.ts");
