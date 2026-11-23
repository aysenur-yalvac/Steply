import { createAdminClient } from '@/utils/supabase/admin';
import { getCachedUser, getCachedProfile } from '@/lib/auth-cache';
import { GitHubIntegrationCard } from '@/components/projects/GitHubIntegrationCard';
import { getGitHubRepoAction, getProjectCommitsAction } from '@/lib/actions';
export const dynamic = "force-dynamic";
import { notFound, redirect } from 'next/navigation';
import { Star, Trash2, Check } from 'lucide-react';
import { createReview, deleteReviewAction } from '../../actions';
import FileSection from '@/components/projects/FileSection';
import ProjectEditableContent from '@/components/projects/ProjectEditableContent';
import ProjectTaskList from '@/components/projects/ProjectTaskList';
import ActivityTimeline from '@/components/projects/ActivityTimeline';
import ProjectNotes from '@/components/projects/ProjectNotes';
import PageWrapper from '@/components/layout/PageWrapper';
import AnimatedProgressBar from '@/components/ui/AnimatedProgressBar';
import { BackButton } from '@/components/ui/back-button';
import { Avatar } from '@/components/ui/avatar';
import { ProjectFile, ProjectTask, getProjectActivitiesAction, getProjectNotesAction, markProjectCompletedAction } from '@/lib/actions';
import ProjectTags from '@/components/projects/ProjectTags';
import ProjectTabsWrapper from '@/components/projects/ProjectTabsWrapper';
import CompleteProjectButton from '@/components/projects/CompleteProjectButton';

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const projectId = resolvedParams.id;
  const error = resolvedSearchParams?.error;

  const admin    = createAdminClient();          // bypasses RLS for all profile reads

  const user = await getCachedUser();
  if (!user) redirect('/auth/login');

  // Round 1: Parallelize viewer profile, project row, project_members, reviews, and project_tasks
  const [
    profile,
    { data: project },
    { data: memberRows },
    { data: rawReviews },
    { data: projectTasksRaw },
  ] = await Promise.all([
    getCachedProfile(),
    admin
      .from('projects')
      .select('*, invite_code, invite_token')
      .eq('id', projectId)
      .single(),
    admin
      .from('project_members')
      .select('user_id, status')
      .eq('project_id', projectId),
    admin
      .from('reviews')
      .select('id, rating, comment, created_at, reviewer_id')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    admin
      .from('project_tasks')
      .select('id, project_id, title, is_completed, assigned_to, due_date, start_date, priority, status, description, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true }),
  ]);

  const isTeacher = profile?.role === 'teacher';

  if (!project) notFound();

  // ── Ownership check — must be explicit string comparison ──────────────────────
  const ownerUserId: string = (project as any).student_id as string;
  const isOwner: boolean = ownerUserId === user.id;

  // ── Privacy gate — project-level only ────────────────────────────────────
  if (!isOwner && (project as any).is_private === true) {
    const jsonTeamIds = ((project.team_members as { id: string }[] | null) ?? []).map((m) => m.id);
    const isAcceptedMember = (memberRows ?? []).some(
      (r: any) => r.user_id === user.id && r.status !== 'pending'
    );
    const isTeamMemberAccess = jsonTeamIds.includes(user.id) || isAcceptedMember;
    if (!isTeamMemberAccess) notFound();
  }

  // Collect all unique user IDs needed across owner, team members, and reviewers into ONE profiles query
  const memberUserIds = (memberRows ?? []).map((r: any) => r.user_id as string);
  const reviewerIds = [...new Set((rawReviews ?? []).map((r: any) => r.reviewer_id as string))];
  const profileIdsToFetch = [...new Set([
    ...(!isOwner && ownerUserId ? [ownerUserId] : []),
    ...memberUserIds,
    ...reviewerIds,
  ])];

  const isAcceptedCollaborator = !isOwner && (memberRows ?? []).some(
    (r: any) => r.user_id === user.id && r.status !== 'pending'
  );
  const isTeamMember = isOwner || isAcceptedCollaborator;

  // Round 2: Fetch all required profiles in a single query in parallel with activities, notes, and GitHub data
  const [
    { data: batchProfiles },
    activities,
    projectNotes,
    repo,
    commits,
  ] = await Promise.all([
    profileIdsToFetch.length > 0
      ? admin.from('profiles').select('id, full_name, avatar_url, role, github_url').in('id', profileIdsToFetch)
      : Promise.resolve({ data: [] as any[] }),
    isTeamMember ? getProjectActivitiesAction(projectId).catch(() => []) : Promise.resolve([]),
    isTeamMember ? getProjectNotesAction(projectId).catch(() => [])      : Promise.resolve([]),
    isTeamMember ? getGitHubRepoAction(projectId).catch(() => null)      : Promise.resolve(null),
    isTeamMember ? getProjectCommitsAction(projectId).catch(() => [])    : Promise.resolve([]),
  ]);

  const profileMap = new Map((batchProfiles ?? []).map((p: any) => [p.id as string, p]));

  // ── Owner identity ────────────────────────────────────────────────────────────
  const ownerProfile = isOwner ? profile : profileMap.get(ownerUserId);
  const ownerName: string | null = isOwner
    ? (profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null)
    : (ownerProfile?.full_name ?? null);
  const ownerAvatarUrl: string | null = ownerProfile?.avatar_url ?? null;
  const ownerGithubUrl: string | null = ownerProfile?.github_url ?? null;

  // ── Team members ──────────────────────────────────────────────────────────────
  type TeamMember = { id: string; full_name: string; avatar_url: string | null; role?: string | null; status?: string | null };
  const statusMap = new Map((memberRows ?? []).map((r: any) => [r.user_id as string, (r.status as string) ?? 'accepted']));
  const allTeamMembers: TeamMember[] = memberUserIds
    .map((uid) => {
      const p = uid === user.id ? profile : profileMap.get(uid);
      return {
        id:         uid,
        full_name:  p?.full_name  ?? 'Bilinmeyen Kullanıcı',
        avatar_url: p?.avatar_url ?? null,
        role:       p?.role       ?? null,
        status:     statusMap.get(uid) ?? 'accepted',
      };
    })
    .filter((m) => m.id);

  const acceptedTeamMembers = allTeamMembers.filter((m) => m.status !== 'pending');
  const teamMembers = isOwner ? allTeamMembers : acceptedTeamMembers;
  const isCollaborator = isAcceptedCollaborator;

  // ── Reviews ───────────────────────────────────────────────────────────────────
  type Review = {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer_id: string;
    reviewer_name: string;
    reviewer_role: string | null;
    reviewer_avatar: string | null;
  };
  const reviews: Review[] = (rawReviews ?? []).map((r: any) => {
    const revProf = r.reviewer_id === user.id ? profile : profileMap.get(r.reviewer_id);
    return {
      ...r,
      reviewer_name:   revProf?.full_name  ?? 'Must-b Academy Üyesi',
      reviewer_role:   revProf?.role       ?? null,
      reviewer_avatar: revProf?.avatar_url ?? null,
    };
  });

  const projectTasks: ProjectTask[] = (projectTasksRaw ?? []) as ProjectTask[];

  const projectStatus = (project as any).status ?? 'todo';
  const isCompleted = projectStatus === 'completed';

  const cleanedDescription = (project.description ?? "")
    .replace(/\[.*?\]/g, "")
    .trim();

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 w-full p-4 sm:p-6 md:p-10 lg:p-12 min-w-0">

        {/* Header */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-1 sm:mb-2 flex-wrap">
          <BackButton href="/dashboard" variant="light" />
          <div className="flex items-center gap-3">
            <Avatar src={ownerAvatarUrl} name={ownerName ?? "S"} size="md" />
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-200 leading-tight break-words">
                {project.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Geliştiren:{" "}
                <span className="font-bold" style={{ color: "#7C3AFF" }}>
                  {ownerName ?? "Must-b Academy Üyesi"}
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Tags — visible to all viewers, edit controls for team only */}
        <ProjectTags
          projectId={projectId}
          initialTags={(project as any).tags ?? []}
          canEdit={isTeamMember}
        />

                <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Content (Tabs) */}
          <div className="flex-1 min-w-0">
            <ProjectTabsWrapper
              showNotesTab={isTeamMember || isTeacher}
              hasNotes={projectNotes.length > 0 || reviews.length > 0}
              projectId={project.id}
              currentUserId={user.id}
              projectNotes={projectNotes}
              reviews={reviews}
              initialTasks={projectTasks}
              teamMembers={teamMembers}
                overviewContent={
                <div className="flex flex-col gap-8">
                  <ProjectEditableContent
                    project={{
                      id:                 project.id,
                      title:              project.title,
                      cleanedDescription: cleanedDescription,
                      start_date:         project.start_date,
                      end_date:           project.end_date,
                      student_id:         project.student_id,
                      github_link:        project.github_link,
                      created_at:         project.created_at,
                      is_private:         (project as any).is_private ?? false,
                      profiles:           ownerName
                        ? { full_name: ownerName, avatar_url: ownerAvatarUrl }
                        : null,
                    }}
                    initialTeamMembers={teamMembers}
                    currentUserId={user.id}
                    isCompleted={isCompleted}
                    isCollaborator={isCollaborator}
                  />
                  
                </div>
              }
              milestonesContent={
                isTeamMember ? (
                  <ProjectTaskList
                        projectId={project.id}
                        initialTasks={projectTasks}
                        canEdit={isTeamMember}
                        teamMembers={teamMembers}
                        currentUserId={user.id}
                        projectOwnerId={ownerUserId}
                        projectOwnerName={ownerName}
                      />
                ) : null
              }
              filesContent={
                <FileSection
                  projectId={project.id}
                  initialFiles={(project.files as ProjectFile[]) || []}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  isTeacher={isTeacher}
                  currentUserId={user.id}
                />
              }
              notesContent={
                <div className="flex flex-col gap-8">
                  {isTeamMember && (
                    <ProjectNotes
                      projectId={project.id}
                      initialNotes={projectNotes}
                      currentUserId={user.id}
                      currentUserName={profile?.full_name ?? null}
                      currentUserAvatar={profile?.avatar_url ?? null}
                    />
                  )}
                  {reviews.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Öğretmen Değerlendirmeleri</h3>
                      {reviews.map((review) => (
                        <div key={review.id} className="rounded-2xl p-6 shadow-sm" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={review.reviewer_avatar} name={review.reviewer_name} size="md" />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-700">{review.reviewer_name}</span>
                                  {review.reviewer_role === 'teacher' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#7C3AFF]/10 text-[#7C3AFF] border border-[#7C3AFF]/20 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80 tracking-wide uppercase">Öğretmen</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                  {new Date(review.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                                ))}
                              </div>
                              {user.id === review.reviewer_id && (
                                <form action={deleteReviewAction}>
                                  <input type="hidden" name="id" value={review.id} />
                                  <input type="hidden" name="project_id" value={project.id} />
                                  <button type="submit" className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Değerlendirmeyi Sil">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap pl-[52px]">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {isTeacher && (
                    <div className="bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-dusty-rose" /> Projeyi Değerlendir
                      </h3>
                      <form action={createReview} className="flex flex-col gap-5">
                        <input type="hidden" name="project_id" value={project.id} />
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puan (1-5)</label>
                          <input type="number" name="rating" min="1" max="5" defaultValue="5" className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-dusty-rose/5 focus:border-dusty-rose/30 transition-all w-24 font-bold" required />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yorum ve Geri Bildirim</label>
                          <textarea name="comment" rows={4} placeholder="Proje hakkındaki değerlendirmenizi yazın..." className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-dusty-rose/5 focus:border-dusty-rose/30 transition-all resize-y placeholder:text-slate-400" required />
                        </div>
                        <button type="submit" className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-95">Değerlendirmeyi Gönder</button>
                      </form>
                    </div>
                  )}
                </div>
              }
            />
          </div>

          {/* Right Sidebar (Status & Actions) */}
          <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Proje Durumu</h3>
              <div className="mb-4">
                {projectStatus === 'completed' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"> Tamamlandı</span>}
                {projectStatus === 'in_review' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60"> İncelemede</span>}
                {projectStatus === 'in_progress' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/60"> Devam Ediyor</span>}
                {projectStatus === 'todo' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700/80"> Yapılacaklar</span>}
              </div>
              
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">İlerleme Durumu</h4>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-200">% {project.progress_percentage}</span>
              </div>
              <AnimatedProgressBar progress={project.progress_percentage} isCompleted={isCompleted} className="h-3" />

              {isOwner && !isCompleted && <CompleteProjectButton projectId={projectId} isCompletedInitial={isCompleted} />}
              {isCompleted && (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm font-semibold p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 shadow-sm w-full">
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Proje Tamamlandı
                </div>
              )}
            </div>
            
            {/* Activity Stream moved to right sidebar */}
            {isTeamMember && (
              <ActivityTimeline activities={activities} />
            )}
          </div>
        </div>

        <div className="w-full col-span-full">
          <GitHubIntegrationCard projectId={projectId} repo={repo} commits={commits} isTeamMember={isTeamMember} githubLink={project.github_link || ownerGithubUrl} />
        </div>
      </div>
    </PageWrapper>
  );
}
