const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldDelete = `export async function softDeleteAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('assignments').update({ is_deleted: true }).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}`;

const newDelete = `export async function softDeleteAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('assignments')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
      console.error('Soft Delete DB Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/assignments');
    revalidatePath('/dashboard/assignments', 'page');
    revalidatePath('/dashboard/trash/assignments');
    revalidatePath('/dashboard/trash/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Silme islemi basarisiz.' };
  }
}`;

actions = actions.replace(oldDelete, newDelete);
fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated actions.ts for soft delete");
