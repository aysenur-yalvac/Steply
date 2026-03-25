import { createClient } from '@/utils/supabase/server';
export const dynamic = "force-dynamic";
import Link from 'next/link';
import { Plus, FolderOpen, Search, SlidersHorizontal } from 'lucide-react';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import EmptyState from '@/components/layout/EmptyState';
import { Suspense } from 'react';
import GlobalSearch from '@/components/dashboard/GlobalSearch';

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
    <div className="flex flex-col min-h-full">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-6 lg:px-8 py-5 lg:pt-8">
        {/* Breadcrumb */}
        <p className="text-xs font-semibold text-slate-400 mb-1">
          Dashboard{' '}
          <span className="text-slate-300 mx-1">›</span>
          <span className="text-slate-600">
            {isTeacher ? 'Portfolio Overview' : 'My Projects'}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {isTeacher ? 'Portfolio Overview' : 'My Projects'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isTeacher
                ? 'Monitor the latest milestones of all watched student projects.'
                : 'Manage your active projects and keep your portfolio up to date.'}
            </p>
          </div>

          {/* Avatar group — right side decorative */}
          <div className="hidden sm:flex items-center -space-x-2 shrink-0">
            {['#7C3AFF', '#FF7F50', '#0EA5E9'].map((color, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ background: color }}
              >
                {['S', 'T', 'M'][i]}
              </div>
            ))}
          </div>
        </div>

        {/* Kanban tab row + search + filter */}
        <div className="flex items-center justify-between gap-4 mt-5 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5"/>
              </svg>
              Kanban
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="2" y1="4" x2="14" y2="4"/>
                <line x1="2" y1="8" x2="14" y2="8"/>
                <line x1="2" y1="12" x2="14" y2="12"/>
              </svg>
              List
            </button>
          </div>

          {/* Search + Filter + New */}
          <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
            <Suspense fallback={<div className="w-56 h-9 bg-slate-100 animate-pulse rounded-2xl" />}>
              <GlobalSearch />
            </Suspense>

            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>

            {!isTeacher && (
              <Link
                href="/dashboard/projects/new"
                className="btn-aura flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl shrink-0 active:scale-95 overflow-hidden"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Kanban content ────────────────────────────────────────────────── */}
      <div className="flex-1 p-6 lg:p-8 lg:pl-8">
        {projects.length === 0 ? (
          <div className="flex justify-center mt-8">
            <EmptyState
              icon={isTeacher ? Search : FolderOpen}
              title={isTeacher ? 'Search Projects' : 'No active projects yet.'}
              description={
                isTeacher
                  ? 'Use the search bar above to look up projects by student name or title.'
                  : 'Every great project starts with a single step. Let\'s build something amazing.'
              }
              action={
                profile?.role === 'student' ? (
                  <Link
                    href="/dashboard/projects/new"
                    className="btn-aura inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Start Your First Project
                  </Link>
                ) : null
              }
            />
          </div>
        ) : (
          <KanbanBoard
            projects={projects}
            isTeacher={isTeacher}
            watchedIds={watchedIds}
            projectNotes={projectNotes}
            currentUserId={user?.id}
          />
        )}
      </div>
    </div>
  );
}
