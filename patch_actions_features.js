const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

// Interface
actions = actions.replace(
  'course_name: string;',
  'course_name: string;\n  is_deleted: boolean;\n  grade: string;'
);

// createAssignmentAction
const oldCreateStart = `export async function createAssignmentAction(formData: {
  title: string;
  description?: string;
  course_name?: string;
  due_date: string;
})`;

const newCreateStart = `export async function createAssignmentAction(formData: {
  title: string;
  description?: string;
  course_name?: string;
  grade?: string;
  due_date: string;
})`;

actions = actions.replace(oldCreateStart, newCreateStart);
actions = actions.replace(
  "course_name: formData.course_name || 'Genel',",
  "course_name: formData.course_name || 'Genel',\n          grade: formData.grade || 'Tumu',"
);

// getAssignmentsAction (filter by is_deleted)
actions = actions.replace(
  ".select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')\n      .order('created_at', { ascending: false });",
  ".select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')\n      .eq('is_deleted', false)\n      .order('created_at', { ascending: false });"
);

// append new actions
const newActions = `
export async function softDeleteAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('assignments').update({ is_deleted: true }).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function restoreAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('assignments').update({ is_deleted: false }).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/trash/assignments', 'page');
    revalidatePath('/dashboard/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function permanentlyDeleteAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/trash/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDeletedAssignmentsAction(): Promise<Assignment[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assignments')
      .select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')
      .eq('is_deleted', true)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function deleteSubmissionAction(id: string, fileUrl: string) {
  try {
    const supabase = await createClient();
    // try to extract path from url. assignments/id/file
    const parts = fileUrl.split('/assignments/');
    if (parts.length === 2) {
      const filePath = parts[1];
      await supabase.storage.from('assignments').remove([filePath]);
    }
    const { error } = await supabase.from('assignment_submissions').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/assignments/[id]', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
`;

actions += newActions;

fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated actions.ts");
