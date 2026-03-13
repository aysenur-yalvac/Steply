import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, FolderOpen } from 'lucide-react';
import ProjectCard from './ProjectCard';
import EmptyState from '@/components/layout/EmptyState';
import { StaggerContainer, StaggerItem } from '@/components/layout/StaggerContainer';

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
    // Teachers see all projects with student info
    const { data } = await supabase
      .from('projects')
      .select('*, profiles:student_id(full_name)')
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
    <StaggerContainer className="flex flex-col gap-10">
      
      {/* Header Strategy */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-md">
            {isTeacher ? "Portfolio Overview" : "Your Architecture"}
          </h1>
          <p className="text-slate-400 font-light text-base md:text-lg max-w-xl leading-relaxed">
            {isTeacher 
              ? "Monitor the latest milestones of all projects uploaded by students." 
              : "Refine your active projects and build the foundation of your engineering journey."}
          </p>
        </div>
        
        {!isTeacher && (
           <Link 
            href="/dashboard/projects/new" 
            className="group relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-[0_0_30px_-5px_var(--color-indigo-500)] hover:shadow-[0_0_40px_0_var(--color-indigo-400)] shrink-0 active:scale-95 border border-indigo-400/30 overflow-hidden"
          >
            {/* Subtle glow sweep animation effect inside button */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]" />
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 relative z-10" strokeWidth={2.5} /> 
            <span className="relative z-10 tracking-wide">Create Project</span>
          </Link>
        )}
      </StaggerItem>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <StaggerItem className="flex justify-center mt-6">
          <EmptyState 
            icon={FolderOpen}
            title={isTeacher ? "No student projects yet" : "Your canvas is blank"}
            description={isTeacher 
              ? "Students who joined the system haven't started any projects yet. They will appear here once created." 
              : "Every great application starts here. Add your first project to begin your portfolio management."}
            action={!isTeacher ? (
              <Link href="/dashboard/projects/new" className="inline-flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group">
                Add a project now <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            ) : null}
          />
        </StaggerItem>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project: any) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} isTeacher={isTeacher} />
            </StaggerItem>
          ))}
        </div>
      )}

    </StaggerContainer>
  );
}
