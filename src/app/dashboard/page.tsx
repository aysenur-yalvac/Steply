import { createClient } from '@/utils/supabase/server';
export const dynamic = "force-dynamic";
import Link from 'next/link';
import { Plus, FolderOpen, Search } from 'lucide-react';
import { AnimatedProjectCards } from '@/components/ui/animated-project-cards';
import EmptyState from '@/components/layout/EmptyState';
import PageWrapper from '@/components/layout/PageWrapper';

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

  if (isTeacher) {
    if (!q) {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles!student_id(full_name)')
        .in('id', Array.from(watchedIds))
        .order('created_at', { ascending: false });
      projects = data || [];
    } else {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles!student_id(full_name)')
        .order('created_at', { ascending: false });
      let all = data || [];
      all = all.filter((p: any) =>
        p.title.toLowerCase().includes(q) ||
        (p.profiles?.full_name || '').toLowerCase().includes(q),
      );
      projects = all;
    }
  } else {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false });
    let all = data || [];
    if (q) all = all.filter((p: any) => p.title.toLowerCase().includes(q));
    projects = all;
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-6 md:p-10 lg:p-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              {isTeacher ? "Portfolio Overview" : "Your Projects"}
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">
              {isTeacher
                ? "Monitor the latest milestones of all projects uploaded by students."
                : "Manage your active projects and keep your portfolio up to date."}
            </p>
          </div>

          {profile?.role === 'student' && (
            <Link
              href="/dashboard/projects/new"
              className="btn-aura group relative flex items-center justify-center gap-2 text-white font-bold px-7 py-3.5 rounded-full shrink-0 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10 tracking-wide">Create Project</span>
            </Link>
          )}
        </div>

        {/* Content */}
        {projects.length === 0 ? (
          <div className="flex justify-center mt-6">
            <EmptyState
              icon={isTeacher ? Search : FolderOpen}
              title={isTeacher ? "Search Projects" : "No active projects yet."}
              description={isTeacher
                ? "Use the search bar above to look up projects by student name or title to begin reviewing."
                : "Every great project starts with a single step. Let's build something amazing."}
              action={profile?.role === 'student' ? (
                <Link
                  href="/dashboard/projects/new"
                  className="btn-aura inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Start Your First Project
                </Link>
              ) : null}
            />
          </div>
        ) : (
          <AnimatedProjectCards
            projects={projects}
            isTeacher={isTeacher}
            watchedIds={watchedIds}
            projectNotes={projectNotes}
            currentUserId={user?.id}
          />
        )}

      </div>
    </PageWrapper>
  );
}
