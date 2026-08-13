import { createClient } from '@/utils/supabase/server';
import { restoreProjectAction, permanentDeleteProjectAction } from '@/lib/actions';
import ProjectCard from '@/app/dashboard/ProjectCard';
import EmptyState from '@/components/layout/EmptyState';
import { Trash2 } from 'lucide-react';

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
      <div className="flex border-b border-slate-200">
        <a href="/dashboard/trash/projects" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Projeler</a>
        <a href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium">Dosyalar</a>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Çöp kutusu boş"
          description="Silinmiş projeniz bulunmuyor."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((project: any) => (
            <div key={project.id} className="relative group">
              <div className="pointer-events-none opacity-50">
                <ProjectCard project={project} currentUserId={user?.id} />
              </div>
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <form action={restoreProjectAction.bind(null, project.id) as any}>
                  <button className="px-4 py-2 bg-white text-slate-800 rounded-xl font-medium shadow-sm hover:shadow-md transition-all text-sm w-36">
                    Geri Yükle
                  </button>
                </form>
                <form action={permanentDeleteProjectAction.bind(null, project.id) as any}>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium shadow-sm hover:bg-red-700 transition-all text-sm w-36">
                    Kalıcı Sil
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
