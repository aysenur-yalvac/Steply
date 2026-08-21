const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldCreate = `export async function createAssignmentAction(
  title: string,
  description: string,
  due_date: string,
  course_name: string
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
      course_name,
      teacher_id: user.id
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/assignments');
  revalidatePath('/dashboard/assignments', 'page');
  return { success: true, assignment: data };
}`;

const newCreate = `export async function createAssignmentAction(formData: {
  title: string;
  description?: string;
  course_name?: string;
  due_date: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Oturum acmis bir kullanici bulunamadi.' };
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert([
        {
          title: formData.title,
          description: formData.description || '',
          course_name: formData.course_name || 'Genel',
          teacher_id: user.id,
          due_date: formData.due_date,
        },
      ])
      .select();

    if (error) {
      console.error('Assignment Insert Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/assignments');
    revalidatePath('/dashboard/assignments', 'page');
    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected createAssignmentAction Error:', err);
    return { success: false, error: err?.message || 'Beklenmeyen bir hata olustu.' };
  }
}`;

if(actions.includes("export async function createAssignmentAction(")) {
    // We can use a regex to replace the function since we know it's at the end or before updateAssignmentAction
    const regex = /export async function createAssignmentAction\([\s\S]*?revalidatePath\('\/dashboard\/assignments', 'page'\);\n  return \{ success: true, assignment: data \};\n\}/;
    actions = actions.replace(regex, newCreate);
    fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
    console.log("Updated createAssignmentAction in actions.ts");
} else {
    console.log("Could not find createAssignmentAction in actions.ts");
}
