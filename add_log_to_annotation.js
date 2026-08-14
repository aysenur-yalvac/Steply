const fs = require('fs');
const path = require('path');

let fp = path.join(process.cwd(), 'src/lib/actions.ts');
let content = fs.readFileSync(fp, 'utf8');

// Update saveFileAnnotationAction to include logProjectActivity
const targetStr = "const { data, error } = await ctx.admin";
const logCode = `
    const fileName = fileUrl.split('/').pop() || 'Dosya';
    const isNote = annotationData?.type === 'sticky_note';
    await logProjectActivity(ctx.admin, projectId, ctx.user.id, isNote ? 'file_noted' : 'file_annotated', \`\${ctx.user.user_metadata?.full_name || 'Kullanıcı'} '\${fileName}' isimli dosyaya yeni \${isNote ? 'not' : 'işaretleme'} ekledi.\`);
`;

if (!content.includes("isNote ? 'file_noted' : 'file_annotated'")) {
    content = content.replace(targetStr, logCode + '\n    ' + targetStr);
    fs.writeFileSync(fp, content, 'utf8');
    console.log("Added Activity Log to saveFileAnnotationAction");
}
