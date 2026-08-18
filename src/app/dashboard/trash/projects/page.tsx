import { createClient } from '@/utils/supabase/server';
import TrashProjectsClient from './TrashProjectsClient';

export default async function TrashProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('*, profiles!student_id(full_name, avatar_url, is_public)')
    .not('deleted_at', 'is', null)
    .eq('student_id', user?.id)
    .order('deleted_at', { ascending: false });

  const items = projects || [];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <a href="/dashboard/trash/projects" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Projeler</a>
        <a href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium">Dosyalar</a>
      </div>

      <TrashProjectsClient initialProjects={items} currentUserId={user?.id || ""} />
    </div>
  );
}
