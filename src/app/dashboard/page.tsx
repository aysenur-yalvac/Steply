import { createClient } from '@/utils/supabase/server';
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Projects | Steply",
};
import Link from 'next/link';
import { Plus, FolderOpen, Search, Users } from 'lucide-react';
import EmptyState from '@/components/layout/EmptyState';
import DashboardViewSwitcher from '@/components/dashboard/DashboardViewSwitcher';
import ProjectCard from '@/app/dashboard/ProjectCard';

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
  const isStudent = profile?.role === 'student';

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
        .select('*, profiles!student_id(full_name, is_public)')
        .in('id', Array.from(watchedIds))
        .order('created_at', { ascending: false });
      // Strip projects whose owner went private after being watched
      projects = (data || []).filter((p: any) => p.profiles?.is_public !== false);
    } else {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles!student_id(full_name, is_public)')
        .order('created_at', { ascending: false });
      // Exclude projects whose owner has set their account to private
      let all = (data || []).filter((p: any) => p.profiles?.is_public !== false);
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
      <div className="bg-white border-b border-slate-100 px-6 lg:px-8 py-5 lg:pt-8 pb-0">
        <p className="text-xs font-semibold text-slate-400 mb-1">
          My Projects{' '}
          <span className="text-slate-300 mx-1">›</span>
          <span className="text-slate-600">
            {isTeacher ? 'Portfolio Overview' : 'All Projects'}
          </span>
        </p>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
          {isTeacher ? 'Portfolio Overview' : 'My Projects'}
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          {isTeacher
            ? 'Monitor the latest milestones of all watched student projects.'
            : 'Manage your active projects and keep your portfolio up to date.'}
        </p>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-10">
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
            />
            <div className="flex justify-center mt-8">
              <EmptyState
                icon={isTeacher ? Search : FolderOpen}
                title={isTeacher ? 'Search Projects' : 'No active projects yet.'}
                description={
                  isTeacher
                    ? 'Use the search bar above to look up projects by student name or title.'
                    : "Every great project starts with a single step. Let's build something amazing."
                }
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
          </>
        ) : (
          <DashboardViewSwitcher
            projects={projects}
            isTeacher={isTeacher}
            isStudent={isStudent}
            watchedIds={watchedIds}
            projectNotes={projectNotes}
            currentUserId={user?.id}
          />
        )}

        {/* ── Ortak Olduğum Projeler ─────────────────────────────────────── */}
        {collaboratorProjects.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="p-2 rounded-xl"
                style={{ background: "rgba(124,58,255,0.12)", border: "1px solid rgba(124,58,255,0.20)" }}
              >
                <Users className="w-4 h-4" style={{ color: "#7C3AFF" }} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                  Ortak Olduğum Projeler
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Ekibine dahil edildiğin projeler — görüntüleyebilir ve düzenleyebilirsin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {collaboratorProjects.map((p: any) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isTeacher={isTeacher}
                  currentUserId={user?.id}
                  isWatched={watchedIds.has(p.id)}
                  isCollaborator
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
