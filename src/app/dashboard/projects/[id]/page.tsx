import { createClient } from '@/utils/supabase/server';
export const dynamic = "force-dynamic";
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Star, Trash2 } from 'lucide-react';
import { createReview, deleteReviewAction } from '../../actions';
import FileSection from '@/components/projects/FileSection';
import ProjectEditableContent from '@/components/projects/ProjectEditableContent';
import PageWrapper from '@/components/layout/PageWrapper';
import AnimatedProgressBar from '@/components/ui/AnimatedProgressBar';
import { BackButton } from '@/components/ui/back-button';
import { ProjectFile } from '@/lib/actions';

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isTeacher = profile?.role === 'teacher';

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      profiles!student_id (full_name, email)
    `)
    .eq('id', projectId)
    .single();

  if (!project) notFound();

  // Resolve owner name: join may be null if FK hint isn't wired in Supabase,
  // so fall back to a direct profiles fetch via student_id.
  let ownerName: string | null = (project.profiles as { full_name?: string } | null)?.full_name ?? null;
  if (!ownerName && project.student_id) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", project.student_id)
      .single();
    ownerName = ownerProfile?.full_name ?? null;
  }

  type Review = {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer_id: string;
    reviewer_name?: string;
  };

  // Step 1: Fetch reviews (no FK join needed)
  const { data: rawReviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, reviewer_id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  // Step 2: Fetch reviewer names separately by their IDs
  let reviews: Review[] = [];
  if (rawReviews && rawReviews.length > 0) {
    const reviewerIds = [...new Set(rawReviews.map((r) => r.reviewer_id))];
    const { data: reviewerProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', reviewerIds);

    const nameMap = new Map(reviewerProfiles?.map((p) => [p.id, p.full_name]) ?? []);
    reviews = rawReviews.map((r) => ({
      ...r,
      reviewer_name: nameMap.get(r.reviewer_id),
    }));
  }

  const isCompleted = project.progress_percentage === 100;

  // Strip any [Priority: ...] / [Platform: ...] metadata that may have been
  // embedded in description as a DB-column fallback by the server action.
  const cleanedDescription = (project.description ?? "")
    .replace(/\[.*?\]/g, "")
    .trim();

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 w-full p-6 md:p-10 lg:p-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
           <BackButton href="/dashboard" variant="light" />
         <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">{project.title}</h2>
            <p className="text-slate-500 text-sm">
              Developed by{" "}
              {ownerName ? (
                <span className="font-bold" style={{ color: "#7C3AFF" }}>{ownerName}</span>
              ) : (
                <span className="inline-block w-24 h-3.5 rounded bg-slate-200 animate-pulse align-middle" />
              )}
              .
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Project Details */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Editable About Project + Team sections */}
          <ProjectEditableContent
            project={{
              id:                 project.id,
              title:              project.title,
              cleanedDescription: cleanedDescription,
              start_date:         project.start_date,
              end_date:           project.end_date,
              student_id:         project.student_id,
              github_link:        project.github_link,
              profiles:           project.profiles,
            }}
            currentUserId={user.id}
            isCompleted={isCompleted}
          />

          {/* File Management Section */}
          <FileSection
            projectId={project.id}
            initialFiles={(project.files as ProjectFile[]) || []}
            isOwner={user.id === project.student_id}
          />

          {/* Reviews List */}
          {reviews && reviews.length > 0 && (
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Teacher Evaluations</h3>
              {reviews.map((review: Review) => (
                <div key={review.id} className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-slate-700">
                          {review.reviewer_name}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                          {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
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
                   <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Progress & Review Form */}
        <div className="flex flex-col gap-8">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Progress Status</h3>
             <div className="flex justify-between items-end mb-2">
                 <span className="text-3xl font-black text-slate-800">%{project.progress_percentage}</span>
             </div>
             <AnimatedProgressBar progress={project.progress_percentage} isCompleted={isCompleted} className="h-3" />
          </div>

          {/* Only teachers can comment */}
          {isTeacher && (
             <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-dusty-rose" /> Evaluate Project
                </h3>
                <form action={createReview} className="flex flex-col gap-5">
                   <input type="hidden" name="project_id" value={project.id} />
                   
                   <div className="flex flex-col gap-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating (1-5)</label>
                     <input 
                       type="number" 
                       name="rating" 
                       min="1" max="5" 
                       defaultValue="5"
                       className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-4 focus:ring-dusty-rose/5 focus:border-dusty-rose/30 transition-all w-24 font-bold"
                       required 
                     />
                   </div>
 
                   <div className="flex flex-col gap-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comment / Feedback</label>
                     <textarea 
                       name="comment" 
                       rows={4}
                       placeholder="Write your thoughts about the project..."
                       className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-4 focus:ring-dusty-rose/5 focus:border-dusty-rose/30 transition-all resize-y placeholder:text-slate-400"
                       required 
                     />
                   </div>
 
                   <button type="submit" className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-95">
                     Submit Review
                   </button>
 
                   {error && (
                      <div className="mt-2 p-3 text-red-500 text-xs bg-red-50 border border-red-100 rounded-xl text-center font-medium">
                        {error}
                      </div>
                   )}
                </form>
             </div>
          )}

        </div>
      </div>
      </div>
    </PageWrapper>
  );
}
