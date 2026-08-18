import { createClient } from '@/utils/supabase/server';
import { GitHubIntegrationCard } from '@/components/projects/GitHubIntegrationCard';
import { getGitHubRepoAction, getProjectCommitsAction } from '@/lib/actions';

import { createAdminClient } from '@/utils/supabase/admin';
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

  const supabase = await createClient();
  const admin    = createAdminClient();          // bypasses RLS for all profile reads

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Current viewer's profile (uses anon client — viewer reads their own row: always works)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isTeacher = profile?.role === 'teacher';

  // Project row
  const { data: project } = await admin
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) notFound();

  // ── Ownership check — must be explicit string comparison ──────────────────────
  const ownerUserId: string = (project as any).student_id as string;
  const isOwner: boolean = ownerUserId === user.id;

  // ── Owner identity ────────────────────────────────────────────────────────────
  let ownerName: string | null = null;
  let ownerAvatarUrl: string | null = null;
  let ownerGithubUrl: string | null = null;

  if (isOwner) {
    // Viewer IS the owner — always allow access, skip all gates.
    ownerName      = profile?.full_name  ?? (user.user_metadata?.full_name as string | undefined) ?? null;
    ownerAvatarUrl = profile?.avatar_url ?? null;
    ownerGithubUrl = profile?.github_url ?? null;
  } else {
    // Viewer is NOT the owner — fetch owner profile for display.
    const { data: ownerProfile, error: ownerErr } = await admin
      .from('profiles')
      .select('full_name, avatar_url, github_url')
      .eq('id', ownerUserId)
      .single();
    if (ownerErr) console.error('owner fetch error:', ownerErr);
    ownerName      = ownerProfile?.full_name  ?? null;
    ownerAvatarUrl = ownerProfile?.avatar_url ?? null;
    ownerGithubUrl = ownerProfile?.github_url ?? null;

    // ── Privacy gate — project-level only ────────────────────────────────────
    // If the project is marked private, only team members can access it.
    const isPrivateProject = (project as any).is_private === true;
    if (isPrivateProject) {
      const jsonTeamIds = ((project.team_members as { id: string }[] | null) ?? []).map((m) => m.id);
      const { data: memberRow } = await admin
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();
      const isTeamMember = jsonTeamIds.includes(user.id) || !!memberRow;
      if (!isTeamMember) notFound();
    }
  }

  // ── Team members — two-step fetch (project_members → profiles) ──────────────
  // NOTE: project_members.user_id FK references auth.users, NOT profiles, so
  // PostgREST cannot resolve profiles!user_id — we fetch separately instead.
  type TeamMember = { id: string; full_name: string; avatar_url: string | null; role?: string | null };
  let teamMembers: TeamMember[] = [];

  const { data: memberRows } = await admin
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId);

  if (memberRows && memberRows.length > 0) {
    const userIds = memberRows.map((r: any) => r.user_id as string);

    const { data: profileRows } = await admin
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .in('id', userIds);

    const profileMap = new Map((profileRows ?? []).map((p: any) => [p.id, p]));

    teamMembers = userIds
      .map((uid) => {
        const p = profileMap.get(uid);
        return {
          id:         uid,
          full_name:  p?.full_name  ?? 'Unknown',
          avatar_url: p?.avatar_url ?? null,
          role:       p?.role       ?? null,
        };
      })
      .filter((m) => m.id);
  }

  // Whether the current viewer is a collaborator (in project_members but not owner)
  const isCollaborator = !isOwner && teamMembers.some((m) => m.id === user.id);

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

  const { data: rawReviews } = await admin
    .from('reviews')
    .select('id, rating, comment, created_at, reviewer_id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  let reviews: Review[] = [];
  if (rawReviews && rawReviews.length > 0) {
    const reviewerIds = [...new Set(rawReviews.map((r) => r.reviewer_id))];
    const { data: reviewerProfiles } = await admin
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .in('id', reviewerIds);

    const revMap = new Map(reviewerProfiles?.map((p) => [p.id, p]) ?? []);
    reviews = rawReviews.map((r) => ({
      ...r,
      reviewer_name:   revMap.get(r.reviewer_id)?.full_name  ?? 'Steply Member',
      reviewer_role:   revMap.get(r.reviewer_id)?.role       ?? null,
      reviewer_avatar: revMap.get(r.reviewer_id)?.avatar_url ?? null,
    }));
  }

  // ── Project Tasks ─────────────────────────────────────────────────────────────
  const { data: projectTasksRaw } = await admin
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  const projectTasks: ProjectTask[] = (projectTasksRaw ?? []) as ProjectTask[];

  // ── Activity Stream + Discussion Notes (owner + collaborators only) ─────────
  const isTeamMember = isOwner || isCollaborator;
  const [activities, projectNotes, repo, commits] = await Promise.all([
    isTeamMember ? getProjectActivitiesAction(projectId).catch(() => []) : Promise.resolve([]),
    isTeamMember ? getProjectNotesAction(projectId).catch(() => [])      : Promise.resolve([]),
    isTeamMember ? getGitHubRepoAction(projectId).catch(() => null)      : Promise.resolve(null),
    isTeamMember ? getProjectCommitsAction(projectId).catch(() => [])    : Promise.resolve([]),
  ]);

  const projectStatus = (project as any).status ?? 'todo';
  const isCompleted = projectStatus === 'completed';

  const cleanedDescription = (project.description ?? "")
    .replace(/\[.*?\]/g, "")
    .trim();

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 w-full p-6 md:p-10 lg:p-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <BackButton href="/dashboard" variant="light" />
          <div className="flex items-center gap-3">
            <Avatar src={ownerAvatarUrl} name={ownerName ?? "S"} size="md" />
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">
                {project.title}
              </h2>
              <p className="text-slate-500 text-sm">
                Developed by{" "}
                <span className="font-bold" style={{ color: "#7C3AFF" }}>
                  {ownerName ?? "Steply Member"}
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
                  />
                ) : null
              }
              filesContent={
                <FileSection
                  projectId={project.id}
                  initialFiles={(project.files as ProjectFile[]) || []}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
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
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Öğretmen Değerlendirmeleri</h3>
                      {reviews.map((review) => (
                        <div key={review.id} className="rounded-2xl p-6 shadow-sm" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={review.reviewer_avatar} name={review.reviewer_name} size="md" />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-700">{review.reviewer_name}</span>
                                  {review.reviewer_role === 'teacher' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#7C3AFF]/10 text-[#7C3AFF] border border-[#7C3AFF]/20 tracking-wide uppercase">Teacher</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                  {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
                                  <button type="submit" className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Delete Review">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap pl-[52px]">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {isTeacher && (
                    <div className="rounded-3xl p-6 md:p-8 shadow-sm" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
                      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-dusty-rose" /> Evaluate Project
                      </h3>
                      <form action={createReview} className="flex flex-col gap-5">
                        <input type="hidden" name="project_id" value={project.id} />
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating (1-5)</label>
                          <input type="number" name="rating" min="1" max="5" defaultValue="5" className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-slate-800 focus:outline-none focus:ring-4 focus:ring-dusty-rose/5 focus:border-dusty-rose/30 transition-all w-24 font-bold" required />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comment / Feedback</label>
                          <textarea name="comment" rows={4} placeholder="Write your thoughts about the project..." className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-slate-700 focus:outline-none focus:ring-4 focus:ring-dusty-rose/5 focus:border-dusty-rose/30 transition-all resize-y placeholder:text-slate-400" required />
                        </div>
                        <button type="submit" className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-95">Submit Review</button>
                      </form>
                    </div>
                  )}
                </div>
              }
            />
          </div>

          {/* Right Sidebar (Status & Actions) */}
          <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
            <div className="rounded-3xl p-6 md:p-8 shadow-sm" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Project Status</h3>
              <div className="mb-4">
                {projectStatus === 'completed' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Completed</span>}
                {projectStatus === 'in_review' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> In Review</span>}
                {projectStatus === 'in_progress' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> In Progress</span>}
                {projectStatus === 'todo' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> To Do</span>}
              </div>
              
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Milestone Progress</h4>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black text-slate-800">% {project.progress_percentage}</span>
              </div>
              <AnimatedProgressBar progress={project.progress_percentage} isCompleted={isCompleted} className="h-3" />

              {isOwner && !isCompleted && <CompleteProjectButton projectId={projectId} isCompletedInitial={isCompleted} />}
              {isCompleted && (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700 text-sm font-semibold p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm w-full">
                  <Check className="w-5 h-5 text-emerald-600" /> Proje Tamamlandı
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
