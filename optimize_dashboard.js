const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// The original sequential queries:
// const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
// ...
// const { data: mentoredData } = await supabase.from('mentored_projects').select('project_id').eq('teacher_id', user?.id);
// ...
// const { data: notesData } = await supabase.from('project_notes').select('project_id, content, profiles!teacher_id(full_name)');
// ... 
// Then we have projects fetch (which depends on isTeacher and mentoredData, so maybe we can't parallelize projects fetch with mentoredData easily? Wait!
// If isTeacher, it uses watchedIds (which comes from mentoredData). So projects fetch MUST happen AFTER mentoredData and profile!
// But we can parallelize:
// 1. profile
// 2. mentoredData
// 3. notesData
// 4. followData
// 5. favorites
// Let's do that!

content = content.replace(
  `  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  let projects: any[] = [];
  let watchedIds = new Set<string>();
  let projectNotes: Record<string, { content: string; teacherName?: string }> = {};

  const { data: mentoredData } = await supabase
    .from('mentored_projects')
    .select('project_id')
    .eq('teacher_id', user?.id);
  watchedIds = new Set(mentoredData?.map((m: any) => m.project_id) || []);

  const { data: notesData } = await supabase
    .from('project_notes')
    .select('project_id, content, profiles!teacher_id(full_name)');
  if (notesData) {
    notesData.forEach((n: any) => {
      projectNotes[n.project_id] = { content: n.content, teacherName: n.profiles?.full_name };
    });
  }

  if (isTeacher) {`,
  `  // Fetch all independent data in parallel
  const [
    profileRes,
    mentoredDataRes,
    notesDataRes,
    followData,
  ] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user?.id).single(),
    supabase.from('mentored_projects').select('project_id').eq('teacher_id', user?.id),
    supabase.from('project_notes').select('project_id, content, profiles!teacher_id(full_name)'),
    user?.id ? getFollowDataAction(user.id) : Promise.resolve({ followers: [], following: [] })
  ]);

  const profile = profileRes.data;
  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  let projects: any[] = [];
  let watchedIds = new Set<string>(mentoredDataRes.data?.map((m: any) => m.project_id) || []);
  let projectNotes: Record<string, { content: string; teacherName?: string }> = {};

  if (notesDataRes.data) {
    notesDataRes.data.forEach((n: any) => {
      projectNotes[n.project_id] = { content: n.content, teacherName: n.profiles?.full_name };
    });
  }

  if (isTeacher) {`
);

// We need to remove the old getFollowDataAction call since we moved it into Promise.all above
content = content.replace(
  `  // 💗 Follow data for social widget 💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗
  const { followers, following } = user?.id
    ? await getFollowDataAction(user.id)
    : { followers: [], following: [] };`,
  `  // 💗 Follow data for social widget 💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗💗
  const { followers, following } = followData;`
);

fs.writeFileSync('src/app/dashboard/page.tsx', content, 'utf8');
console.log('Optimized dashboard/page.tsx');
