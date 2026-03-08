import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const isTeacher = profile?.role === 'teacher';

  // Fetch projects
  let projects = [];
  
  if (isTeacher) {
    // Teachers see all projects
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    projects = data || [];
  } else {
    // Students see their own projects
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false });
    projects = data || [];
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Strategy */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isTeacher ? "Tüm Öğrenci Projeleri" : "Projelerim"}
          </h2>
          <p className="text-slate-400 text-sm">
            {isTeacher 
              ? "Öğrencilerin yüklediği tüm projelerin güncel adımlarını izleyin." 
              : "Aktif projelerinizi yönetin ve ilerlemenizi danışmanınızla paylaşın."}
          </p>
        </div>
        
        {!isTeacher && (
          <Link 
            href="/dashboard/new" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)] shrink-0"
          >
            <Plus className="w-5 h-5" /> Yeni Proje
          </Link>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-slate-800/50 rounded-2xl border-dashed">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Henüz proje bulunmuyor</h3>
          <p className="text-slate-400 text-center max-w-sm mb-6">
            {isTeacher 
              ? "Sisteme katılan öğrenciler henüz bir proje başlatmamış." 
              : "Proje yönetimine başlamak için ilk projenizi ekleyin."}
          </p>
          {!isTeacher && (
            <Link href="/dashboard/new" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
              Hemen proje ekle &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} isTeacher={isTeacher} />
          ))}
        </div>
      )}

    </div>
  );
}
