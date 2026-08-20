const fs = require('fs');
let path = 'src/app/dashboard/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix createProject return type
content = content.replace(
  /export async function createProject\(formData: FormData\): Promise<\{ success: true \} \| \{ success: false; error: string \}> \{/,
  `export async function createProject(formData: FormData): Promise<{ success: true; project?: any } | { success: false; error: string }> {`
);

// Fix createProject insert 1
content = content.replace(
  /const \{ error \} = await supabase\.from\("projects"\)\.insert\(\{/,
  `const { error, data: newProject1 } = await supabase.from("projects").insert({`
);

content = content.replace(
  /\.\.\.\(tags\.length > 0 \? \{ tags \} : \{\}\),\n\s*\}\);/g,
  `...(tags.length > 0 ? { tags } : {}),\n    }).select().single();`
);

// Fix createProject fallback insert
content = content.replace(
  /const \{ error: error2 \} = await supabase\.from\("projects"\)\.insert\(\{/,
  `const { error: error2, data: newProject2 } = await supabase.from("projects").insert({`
);

content = content.replace(
  /invite_token,\n\s*\}\);/g,
  `invite_token,\n        }).select().single();`
);

content = content.replace(
  /await trackProjectType\(platform\);\n\n\s*return \{ success: true \};\n\}/,
  `await trackProjectType(platform);\n\n  return { success: true, project: newProject1 || newProject2 || null };\n}`
);

// Add joinProjectWithCodeAction
const joinAction = `
export async function joinProjectWithCodeAction(code: string): Promise<{ success: boolean; error?: string; projectId?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Oturum bulunamadı." };

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: "Geçersiz kod." };

    // 1. Projeyi bul
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .select('id')
      .eq('invite_code', cleanCode)
      .single();

    if (pErr || !project) {
      return { success: false, error: "Geçersiz veya bulunamayan katılım kodu!" };
    }

    // 2. Üyelik kontrolü
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      return { success: false, error: "Zaten bu projenin üyesisiniz." };
    }

    // 3. Üyeyi ekle
    const { error: insertErr } = await supabase
      .from('project_members')
      .insert({ project_id: project.id, user_id: user.id });

    if (insertErr) {
      return { success: false, error: "Projeye katılırken bir hata oluştu." };
    }

    return { success: true, projectId: project.id };
  } catch (e: any) {
    console.error("[joinProjectWithCodeAction] Exception:", e);
    return { success: false, error: "Beklenmedik bir hata oluştu." };
  }
}
`;

if (!content.includes('joinProjectWithCodeAction')) {
  content += joinAction;
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed actions.ts for createProject and added joinProjectWithCodeAction');
