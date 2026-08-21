const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const typesAndActions = `
// ==========================================
// ASSIGNMENTS MODULE
// ==========================================

export interface Assignment {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  due_date: string;
  created_at: string;
  teacher?: { full_name: string | null };
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  file_name: string;
  submitted_at: string;
  student?: { full_name: string | null };
}

export async function createAssignmentAction(
  title: string,
  description: string,
  due_date: string
): Promise<{ success: true; assignment: Assignment } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      title,
      description,
      due_date,
      teacher_id: user.id
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/assignments');
  return { success: true, assignment: data };
}

export async function updateAssignmentAction(
  id: string,
  title: string,
  description: string,
  due_date: string
): Promise<{ success: true; assignment: Assignment } | { error: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('assignments')
    .update({ title, description, due_date })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(\`/dashboard/assignments/\${id}\`);
  revalidatePath('/dashboard/assignments');
  return { success: true, assignment: data };
}

export async function deleteAssignmentAction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('assignments').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/assignments');
  return { success: true };
}

export async function getAssignmentsAction(): Promise<Assignment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
  return data || [];
}

export async function getAssignmentByIdAction(id: string): Promise<Assignment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function submitAssignmentAction(
  assignment_id: string,
  file_url: string,
  file_name: string
): Promise<{ success: true; submission: AssignmentSubmission } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert({
      assignment_id,
      student_id: user.id,
      file_url,
      file_name
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(\`/dashboard/assignments/\${assignment_id}\`);
  return { success: true, submission: data };
}

export async function getAssignmentSubmissionsAction(assignment_id: string): Promise<AssignmentSubmission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*, student:profiles!assignment_submissions_student_id_fkey(full_name)')
    .eq('assignment_id', assignment_id)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  return data || [];
}
`;

actions += "\n" + typesAndActions;

fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Added assignments actions to src/lib/actions.ts");
