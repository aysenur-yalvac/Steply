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
      <TrashFilesClient initialFiles={deletedFiles} />
    </div>
  );
}
