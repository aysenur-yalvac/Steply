const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldRegex = /export async function updateAssignmentAction\([\s\S]*?\}\) \{[\s\S]*?\n\}/;

const newAction = `export async function updateAssignmentAction(id: string, payload: {
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

actions = actions.replace(oldRegex, newAction);
fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Replaced existing updateAssignmentAction with the payload-based one.");
