const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldGet = `export async function getAssignmentsAction(): Promise<Assignment[]> {
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
}`;

const newGet = `export async function getAssignmentsAction(): Promise<Assignment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAssignmentsAction] Supabase Database Error fetching assignments:', error.message, error.details, error.hint);
    // Don't just swallow the error, throw it so page.tsx can render an error boundary or we at least see it in server logs
    throw new Error('Odevler veritabanindan cekilemedi: ' + error.message);
  }
  return data || [];
}`;

actions = actions.replace(oldGet, newGet);
fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated getAssignmentsAction");
