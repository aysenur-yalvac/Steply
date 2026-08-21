const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

const oldDelete = `export async function softDeleteAssignmentAction(id: string) {
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

const newDelete = `export async function softDeleteAssignmentAction(id: string) {
  try {
    const supabase = await createClient();
    
    // .select() ekleyerek gercekten etkilenen satiri cekiyoruz!
    const { data, error } = await supabase
      .from('assignments')
      .update({ is_deleted: true })
      .eq('id', id)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    // EGER DATA BOSSA RLS ENGELLEMIS DEMEKTIR, KESINLIKLE BASARILI DONME!
    if (!data || data.length === 0) {
      return { 
        success: false, 
        error: 'Veritabaninda 0 satir guncellendi! RLS kurali guncellemeye izin vermiyor.' 
      };
    }

    revalidatePath('/dashboard/assignments');
    revalidatePath('/dashboard/trash/assignments');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Silme islemi basarisiz.' };
  }
}`;

actions = actions.replace(oldDelete, newDelete);
fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated actions.ts for soft delete with row count check");
