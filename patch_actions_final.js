const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldCode = `export async function updateAssignmentAction(
  id: string,
  title: string,
  description: string,
  due_date: string,
  course_name: string
): Promise<{ success: true; assignment: Assignment } | { error: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('assignments')
    .update({ title, description, due_date, course_name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating assignment:', error);
    return { error: 'Odev guncellenirken bir hata olustu.' };
  }

  revalidatePath('/dashboard/assignments');
  return { success: true, assignment: data };
}`;

const newCode = `export async function updateAssignmentAction(id: string, payload: {
  title: string;
  description?: string;
  course_name: string;
  grade: string;
  due_date: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assignments')
      .update({
        title: payload.title,
        description: payload.description,
        course_name: payload.course_name,
        grade: payload.grade,
        due_date: payload.due_date,
      })
      .eq('id', id)
      .select();

    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: 'Guncelleme yetkisi reddedildi.' };

    revalidatePath('/dashboard/assignments');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Guncelleme hatasi.' };
  }
}`;

actions = actions.replace(oldCode, newCode);
fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Replaced using string match.");
