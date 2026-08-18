import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import TrashFilesClient from './TrashFilesClient';

export default async function TrashFilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  
  // 6. GÜVENLİK: Ortak çalışanların sildiği dosyalar proje sahibinin çöp kutusuna düşer.
  // Bu yüzden kullanıcının sahibi olduğu projeleri çekiyoruz (ortak olunan projeleri de çekebiliriz ama sahibi olduğu yeterli)
  const { data: memberProjects } = await admin
    .from('project_members')
    .select('project_id')
    .eq('student_id', user?.id);
    
  const memberIds = memberProjects?.map(m => m.project_id) || [];
  const orQuery = memberIds.length > 0 
    ? `student_id.eq.${user?.id},id.in.(${memberIds.join(',')})` 
    : `student_id.eq.${user?.id}`;

  const { data: projects } = await admin
    .from('projects')
    .select('id, title, files')
    .or(orQuery);

  let deletedFiles: any[] = [];
  (projects || []).forEach(p => {
    const files = (p.files as any[]) || [];
    files.forEach(f => {
      if (f.deleted_at) {
        deletedFiles.push({ ...f, projectId: p.id, projectName: p.title });
      }
    });
  });

  deletedFiles.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <a href="/dashboard/trash/projects" className="px-4 py-2 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 font-medium">Projeler</a>
        <a href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Dosyalar</a>
      </div>

      <TrashFilesClient initialFiles={deletedFiles} />
    </div>
  );
}
