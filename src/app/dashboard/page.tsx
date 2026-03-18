import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, FolderOpen } from 'lucide-react';
import ProjectCard from './ProjectCard';
import EmptyState from '@/components/layout/EmptyState';
import PageWrapper from '@/components/layout/PageWrapper';
import TeacherSearch from '@/components/dashboard/TeacherSearch';

export default async function DashboardPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q?.toLowerCase() || '';

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
  let watchedIds = new Set<string>();
  let projectNotes: Record<string, string> = {};
  
  if (isTeacher) {
    // Teachers see all projects with student info
    const { data } = await supabase
      .from('projects')
      .select('*, profiles:student_id(full_name)')
      .order('created_at', { ascending: false });
    
    let allProjects = data || [];
    if (q) {
      allProjects = allProjects.filter((p: any) => 
        p.title.toLowerCase().includes(q) || 
        (p.profiles?.full_name || '').toLowerCase().includes(q)
      );
    }
    projects = allProjects;

    // Fetch watched projects
    const { data: mentoredData } = await supabase
      .from('mentored_projects')
      .select('project_id')
      .eq('teacher_id', user?.id);
    watchedIds = new Set(mentoredData?.map((m: any) => m.project_id) || []);

    // Fetch notes
    const { data: notesData } = await supabase
      .from('project_notes')
      .select('project_id, content')
      .eq('teacher_id', user?.id);
    if (notesData) {
      notesData.forEach((n: any) => {
        projectNotes[n.project_id] = n.content;
      });
    }

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
    <PageWrapper>
      <div className="flex flex-col gap-8 w-full">
        
        {/* Header Strategy */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 tracking-tight">
              {isTeacher ? "Portfolio Overview" : "Your Projects"}
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl">
              {isTeacher 
                ? "Monitor the latest milestones of all projects uploaded by students." 
                : "Manage your active tasks and keep your engineering portfolio up to date."}
            </p>
          </div>
        
          {!isTeacher && (
           <Link 
            href="/dashboard/projects/new" 
            className="group relative flex items-center gap-2 bg-dusty-rose hover:bg-rose-600 text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg shrink-0 active:scale-95 border border-white/20 overflow-hidden"
          >
            {/* Subtle glow sweep animation effect inside button, only active on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 relative z-10" strokeWidth={2.5} /> 
            <span className="relative z-10 tracking-wide">Create Project</span>
          </Link>
        )}
      </div>

      {isTeacher && <TeacherSearch />}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex justify-center mt-6">
          <EmptyState 
            icon={FolderOpen}
            title={isTeacher ? "No student projects yet" : "No active projects"}
            description={isTeacher 
              ? "Students haven't started any projects yet. They will appear here once created." 
              : "Start by creating a new project to organize your development work."}
            action={!isTeacher ? (
              <Link href="/dashboard/projects/new" className="inline-flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group">
                Create a project <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            ) : null}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {projects.map((project: any) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              isTeacher={isTeacher} 
              isWatched={watchedIds.has(project.id)}
              teacherNote={projectNotes[project.id]}
            />
          ))}
        </div>
      )}

      </div>
    </PageWrapper>
  );
}
