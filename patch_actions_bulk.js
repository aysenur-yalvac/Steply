const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const newActions = `

// Toplu Geri Yukle
export async function bulkRestoreAssignmentsAction(ids: string[]) {
  try {
    const supabase = await createClient();
    const { error, data } = await supabase
      .from('assignments')
      .update({ is_deleted: false })
      .in('id', ids)
      .select();

    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: 'Veritabaninda 0 satir guncellendi! RLS kurali izin vermiyor.' };
    
    revalidatePath('/dashboard/assignments', 'page');
    revalidatePath('/dashboard/trash/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Toplu Kalici Sil
export async function bulkPermanentDeleteAssignmentsAction(ids: string[]) {
  try {
    const supabase = await createClient();
    const { error, data } = await supabase
      .from('assignments')
      .delete()
      .in('id', ids)
      .select();

    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: 'Veritabaninda 0 satir silindi! RLS kurali izin vermiyor.' };

    revalidatePath('/dashboard/trash/assignments', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
`;

actions += newActions;
fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated actions.ts for bulk actions");
