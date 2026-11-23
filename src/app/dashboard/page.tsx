import { Suspense } from 'react';
import DashboardLoading from './loading';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCachedUser, getCachedProfile } from '@/lib/auth-cache';
import type { Metadata } from "next";
import Link from 'next/link';
import { Plus, FolderOpen, AlertTriangle, Clock } from 'lucide-react';
import EmptyState from '@/components/layout/EmptyState';
import DashboardViewSwitcher from '@/components/dashboard/DashboardViewSwitcher';
import SocialWidget from '@/components/dashboard/SocialWidget';
import PendingInvitesSection, { type PendingProjectInvite } from '@/components/dashboard/PendingInvitesSection';
import { getFollowDataAction } from '@/lib/actions';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projelerim | Must-b Academy",
};

async function DashboardContent(props: { searchParams?: Promise<{ q?: string }> }) {
  const [searchParams, user] = await Promise.all([
    props.searchParams,
    getCachedUser(),
  ]);
  const q = searchParams?.q?.toLowerCase() || '';

  const supabase = await createClient();
  const admin = createAdminClient();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  // Round 1: Run ALL user-dependent independent queries in parallel!
  const [profile, notesDataRes, followData, upcomingTasksRes, membershipRes] = await Promise.all([
    getCachedProfile(),
    supabase.from('project_notes').select('project_id, content, profiles!teacher_id(full_name)'),
    user?.id ? getFollowDataAction(user.id) : Promise.resolve({ followers: [], following: [] }),
    user?.id
      ? supabase
          .from('agenda_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .lte('due_date', tomorrowStr)
          .gte('due_date', todayStr)
          .order('due_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    user?.id
      ? admin.from('project_members').select('*').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ]);

  if ((membershipRes as any)?.error) {
    console.error('[Dashboard] project_members fetch error:', (membershipRes as any).error);
  }

  const isTeacher = profile?.role === 'teacher';
  const isStudent = !isTeacher;
  const { followers, following } = followData;
  const upcomingTasks = upcomingTasksRes.data ?? [];

  const projectNotes: Record<string, { content: string; teacherName?: string }> = {};
  if (notesDataRes.data) {
    notesDataRes.data.forEach((n: any) => {
      projectNotes[n.project_id] = { content: n.content, teacherName: n.profiles?.full_name };
    });
  }

  const membershipRows = membershipRes.data ?? [];
  const acceptedCollabIds = membershipRows
    .filter((r: any) => r.status !== 'pending')
    .map((r: any) => r.project_id as string);
  const pendingInviteIds = membershipRows
    .filter((r: any) => r.status === 'pending')
    .map((r: any) => r.project_id as string);

  // Round 2: Fetch main projects, accepted collaborator projects, and pending invited projects in parallel
  const [mainProjectsRes, collabRes, invitedProjectsRes] = await Promise.all([
    isTeacher
      ? admin
          .from('projects')
          .select('*, profiles!student_id(full_name, avatar_url, is_public)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
      : supabase
          .from('projects')
          .select('*')
          .is('deleted_at', null)
          .eq('student_id', user?.id)
          .order('created_at', { ascending: false }),
    acceptedCollabIds.length > 0
      ? admin
          .from('projects')
          .select('*, profiles!student_id(full_name, avatar_url)')
          .in('id', acceptedCollabIds)
          .is('deleted_at', null)
          .neq('student_id', user?.id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    pendingInviteIds.length > 0
      ? admin
          .from('projects')
          .select('*')
          .in('id', pendingInviteIds)
          .is('deleted_at', null)
          .neq('student_id', user?.id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if ((mainProjectsRes as any)?.error) {
    console.error('[Dashboard] mainProjectsRes error:', (mainProjectsRes as any).error);
  }
  if ((collabRes as any)?.error) {
    console.error('[Dashboard] collabRes error:', (collabRes as any).error);
  }
  if ((invitedProjectsRes as any)?.error) {
    console.error('[Dashboard] invitedProjectsRes error:', (invitedProjectsRes as any).error);
  }

  let projects: any[] = mainProjectsRes.data ?? [];
  if (isTeacher) {
    projects = projects.filter((p: any) => p.profiles?.is_public !== false);
    if (q) {
      projects = projects.filter((p: any) =>
        p.title.toLowerCase().includes(q) ||
        (p.profiles?.full_name || '').toLowerCase().includes(q) ||
        (p.tags ?? []).some((t: string) => t.includes(q)),
      );
    }
  } else if (q) {
    projects = projects.filter((p: any) =>
      p.title.toLowerCase().includes(q) ||
      (p.tags ?? []).some((t: string) => t.includes(q))
    );
  }

  let collaboratorProjects: any[] = collabRes.data ?? [];
  const invitedProjects = invitedProjectsRes.data ?? [];

  const allProjectIds = [
    ...new Set([
      ...projects.map((p: any) => p.id as string),
      ...collaboratorProjects.map((p: any) => p.id as string),
    ]),
  ];
  const inviterOwnerIds = [
    ...new Set(invitedProjects.map((p: any) => p.student_id).filter(Boolean)),
  ];

  // Round 3: Fetch teacher reviews count + inviter profiles in parallel
  const [reviewsRes, inviterProfilesRes] = await Promise.all([
    allProjectIds.length > 0
      ? admin.from('reviews').select('project_id').in('project_id', allProjectIds)
      : Promise.resolve({ data: [] }),
    inviterOwnerIds.length > 0
      ? admin.from('profiles').select('id, full_name, avatar_url').in('id', inviterOwnerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const commentCountMap: Record<string, number> = {};
  for (const row of reviewsRes.data ?? []) {
    commentCountMap[row.project_id] = (commentCountMap[row.project_id] ?? 0) + 1;
  }

  projects = projects.map((p: any) => ({
    ...p,
    comment_count: commentCountMap[p.id] ?? 0,
  }));
  collaboratorProjects = collaboratorProjects.map((p: any) => ({
    ...p,
    comment_count: commentCountMap[p.id] ?? 0,
  }));

  const ownerMap = new Map((inviterProfilesRes.data ?? []).map((p: any) => [p.id, p]));
  const pendingInvites: PendingProjectInvite[] = invitedProjects.map((p: any) => {
    const owner = ownerMap.get(p.student_id);
    return {
      projectId: p.id,
      projectTitle: p.title,
      projectDescription: p.description ?? null,
      inviterName: owner?.full_name || 'Must-b Academy Üyesi',
      inviterAvatar: owner?.avatar_url ?? null,
    };
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="bg-transparent dark:bg-transparent border-b border-slate-100 dark:border-slate-800/60 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:pt-8 pb-0">
        <p className="text-xs font-semibold text-slate-400 mb-1">
          Projelerim{' '}
          <span className="text-slate-300 mx-1">›</span>
          <span className="text-slate-600 dark:text-slate-300">
            {isTeacher ? 'Portfolyo Genel Bakış' : 'Tüm Projeler'}
          </span>
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight leading-tight">
          {isTeacher ? 'Portfolyo Genel Bakış' : 'Projelerim'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-4">
          {isTeacher
            ? 'Tüm öğrenci projelerinin son aşamalarını takip edin.'
            : 'Aktif projelerinizi yönetin ve portfolyonuzu güncel tutun.'}
        </p>
        <div className="pb-5">
          <SocialWidget followers={followers} following={following} />
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 min-w-0">

        {/* ── Davet Edildiğiniz Projeler ────────────────────────────────────── */}
        {pendingInvites.length > 0 && (
          <PendingInvitesSection initialInvites={pendingInvites} />
        )}

        {/* ── Upcoming Tasks Banner ─────────────────────────────────────────── */}
        {isStudent && upcomingTasks.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/35 dark:border-amber-700/50 dark:text-amber-100 px-5 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-amber-800">Yaklaşan Görevler — Hemen Harekete Geçin!</p>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingTasks.map((task: any) => {
                const isToday = task.due_date === todayStr;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                      isToday
                        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200'
                        : 'bg-transparent dark:bg-transparent border-amber-200 text-amber-800'
                    }`}
                  >
                    <Clock className={`w-4 h-4 shrink-0 ${isToday ? 'text-red-500' : 'text-amber-500'}`} strokeWidth={2} />
                    <span className="flex-1 truncate">{task.title || task.task_title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isToday ? 'bg-red-100 text-red-700 ' : 'bg-amber-100 text-amber-700 '} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80`}>
                      {isToday ? 'Bugün Teslim!' : 'Yarın Teslim'}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/dashboard/agenda"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              Tüm ajanda görevlerini gör →
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
              projectNotes={projectNotes}
              currentUserId={user?.id}
              collaboratorProjects={collaboratorProjects}
            />
            {!isTeacher && (
              <div className="flex justify-center mt-8">
                <EmptyState
                  icon={FolderOpen}
                  title="Henüz aktif proje bulunmuyor."
                  description="Her büyük başarı bir adımla başlar. Hemen yeni bir proje oluşturun ve çalışmaya başlayın."
                  action={
                    isStudent ? (
                      <Link
                        href="/dashboard/projects/new"
                        className="btn-aura inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl"
                      >
                        <Plus className="w-4 h-4" /> İlk Projenizi Başlatın
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
            projectNotes={projectNotes}
            currentUserId={user?.id}
            collaboratorProjects={collaboratorProjects}
          />
        )}
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
