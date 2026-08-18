import { Suspense } from 'react';
import DashboardLoading from './loading';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Projects | Steply",
};
import Link from 'next/link';
import { Plus, FolderOpen, Search, Users, AlertTriangle, Clock } from 'lucide-react';
import EmptyState from '@/components/layout/EmptyState';
import DashboardViewSwitcher from '@/components/dashboard/DashboardViewSwitcher';
import ProjectCard from '@/app/dashboard/ProjectCard';
import SocialWidget from '@/components/dashboard/SocialWidget';
import { getFollowDataAction } from '@/lib/actions';

async function DashboardContent(props: { searchParams?: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q?.toLowerCase() || '';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all independent data in parallel
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

  if (isTeacher) {
    // Use admin client to bypass RLS on profiles join — teachers need to read
    // student names from other users' profiles which the session client blocks.
    const admin = createAdminClient();
    if (!q) {
      const watchedArr = Array.from(watchedIds);
      if (watchedArr.length > 0) {
        const { data } = await admin
          .from('projects')
          .select('*, profiles!student_id(full_name, avatar_url, is_public)')
          .in('id', watchedArr)
          .order('created_at', { ascending: false });
        projects = (data || []).filter((p: any) => p.profiles?.is_public !== false);
      }
    } else {
      const { data } = await admin
        .from('projects')
        .select('*, profiles!student_id(full_name, avatar_url, is_public)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      let all = (data || []).filter((p: any) => p.profiles?.is_public !== false);
      all = all.filter((p: any) =>
        p.title.toLowerCase().includes(q) ||
        (p.profiles?.full_name || '').toLowerCase().includes(q) ||
        (p.tags ?? []).some((t: string) => t.includes(q)),
      );
      projects = all;
    }
  } else {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .is('deleted_at', null)
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false });
    let all = data || [];
    if (q) all = all.filter((p: any) =>
      p.title.toLowerCase().includes(q) ||
      (p.tags ?? []).some((t: string) => t.includes(q))
    );
    projects = all;
  }

  // ── Follow data for social widget ───────────────────────────────────────────
  const { followers, following } = user?.id
    ? await getFollowDataAction(user.id)
    : { followers: [], following: [] };

  // ── Favorited project IDs (for heart buttons on non-owned cards) ─────────────
  let favoritedIds = new Set<string>();
  if (user?.id) {
    const { data: favData } = await supabase
      .from('project_favorites')
      .select('project_id')
      .eq('user_id', user.id);
    favoritedIds = new Set((favData ?? []).map((r: any) => r.project_id as string));
  }

  // ── Upcoming agenda tasks (due within 24h, not completed) ────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: upcomingTasks } = await supabase
    .from('agenda_tasks')
    .select('id, title, due_date')
    .eq('user_id', user?.id)
    .eq('is_completed', false)
    .lte('due_date', tomorrowStr)
    .gte('due_date', todayStr)
    .order('due_date', { ascending: true });

  // ── Collaborator projects: projects where user is in project_members but NOT owner ──
  let collaboratorProjects: any[] = [];
  const { data: membershipRows } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', user?.id);

  const collabProjectIds = (membershipRows ?? []).map((r: any) => r.project_id as string);

  if (collabProjectIds.length > 0) {
    const { data: collabData } = await supabase
      .from('projects')
      .select('*, profiles!student_id(full_name, avatar_url)')
      .in('id', collabProjectIds)
      .neq('student_id', user?.id)
      .order('created_at', { ascending: false });
    collaboratorProjects = collabData ?? [];
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 px-6 lg:px-8 py-5 lg:pt-8 pb-0">
        <p className="text-xs font-semibold text-slate-400 mb-1">
          My Projects{' '}
          <span className="text-slate-300 mx-1">›</span>
          <span className="text-slate-600">
            {isTeacher ? 'Portfolio Overview' : 'All Projects'}
          </span>
        </p>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          {isTeacher ? 'Portfolio Overview' : 'My Projects'}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 mb-4">
          {isTeacher
            ? 'Monitor the latest milestones of all watched student projects.'
            : 'Manage your active projects and keep your portfolio up to date.'}
        </p>
        <div className="pb-5">
          <SocialWidget followers={followers} following={following} />
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6">

        {/* ── Upcoming Tasks Banner ─────────────────────────────────────────── */}
        {isStudent && upcomingTasks && upcomingTasks.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-amber-800">Upcoming Tasks — Act Now!</p>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingTasks.map((task: any) => {
                const isToday = task.due_date === todayStr;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                      isToday
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-white dark:bg-slate-900 border-amber-200 text-amber-800'
                    }`}
                  >
                    <Clock className={`w-4 h-4 shrink-0 ${isToday ? 'text-red-500' : 'text-amber-500'}`} strokeWidth={2} />
                    <span className="flex-1 truncate">{task.title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isToday ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isToday ? 'Due Today!' : 'Due Tomorrow'}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/dashboard/agenda"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              View all agenda tasks →
            </Link>
          </div>
        )}

        {/* My Projects / Watched section */}
        {projects.length === 0 ? (
          <>
            <DashboardViewSwitcher
              projects={[]}
              isTeacher={isTeacher}
              isStudent={isStudent}
              watchedIds={watchedIds}
              projectNotes={projectNotes}
              currentUserId={user?.id}
              collaboratorProjects={collaboratorProjects}
            />
            {!isTeacher && (
              <div className="flex justify-center mt-8">
                <EmptyState
                  icon={FolderOpen}
                  title="No active projects yet."
                  description="Every great project starts with a single step. Let's build something amazing."
                  action={
                    isStudent ? (
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
            )}
          </>
        ) : (
          <DashboardViewSwitcher
            projects={projects}
            isTeacher={isTeacher}
            isStudent={isStudent}
            watchedIds={watchedIds}
            projectNotes={projectNotes}
            currentUserId={user?.id}
            collaboratorProjects={collaboratorProjects}
          />
        )}

        {/* ── Ortak Olduğum Projeler ─────────────────────────────────────── */}
              </div>
    </div>
  );
}

export default function DashboardPage(props: { searchParams?: Promise<{ q?: string }> }) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent {...props} />
    </Suspense>
  );
}
