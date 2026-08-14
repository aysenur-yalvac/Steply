const fs = require('fs');
const path = require('path');

let fp = path.join(process.cwd(), 'src/lib/actions.ts');
let content = fs.readFileSync(fp, 'utf8');

if (!content.includes('saveFileDrawingsAction')) {
  const newAction = `
export async function saveFileDrawingsAction(
  projectId: string,
  fileUrl: string,
  drawingData: any
) {
  try {
    const supabase = await createClient();
    const ctx = await assertProjectAccess(supabase, projectId);
    if (!ctx) return { error: 'Unauthorized' };

    const { data, error } = await ctx.admin
      .from('file_annotations')
      .insert({
        project_id: projectId,
        file_url: fileUrl,
        author_id: ctx.user.id,
        annotation_data: { type: 'drawing', lines: drawingData }
      })
      .select('*')
      .single();

    if (error) return { error: error.message };

    // Activity log for drawing
    const fileName = fileUrl.split('/').pop() || 'Dosya';
    await logProjectActivity(ctx.admin, projectId, ctx.user.id, 'file_annotated', \`\${ctx.user.user_metadata?.full_name || 'Kullanıcı'} '\${fileName}' isimli dosyaya yeni çizim/işaretleme ekledi.\`);

    if (data) {
      const { data: profile } = await ctx.admin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', ctx.user.id)
        .single();
      if (profile) data.author = profile;
    }

    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}
`;
  content = content + "\n" + newAction;
  fs.writeFileSync(fp, content, 'utf8');
}

console.log("Added saveFileDrawingsAction to actions.ts");
