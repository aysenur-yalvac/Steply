const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldRestore = `export async function restoreAssignmentAction(id: string) {
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
}`;

const newRestore = `export async function restoreAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('assignments').update({ is_deleted: false }).eq('id', id).select();
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: 'Veritabaninda 0 satir guncellendi! RLS kurali izin vermiyor.' };
    revalidatePath('/dashboard/trash/assignments', 'page');
    revalidatePath('/dashboard/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}`;

actions = actions.replace(oldRestore, newRestore);

const oldPermDelete = `export async function permanentlyDeleteAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/trash/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}`;

const newPermDelete = `export async function permanentlyDeleteAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('assignments').delete().eq('id', id).select();
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: 'Veritabaninda 0 satir silindi! RLS kurali izin vermiyor.' };
    revalidatePath('/dashboard/trash/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}`;

actions = actions.replace(oldPermDelete, newPermDelete);

fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated restore and perm delete actions for row count check");
