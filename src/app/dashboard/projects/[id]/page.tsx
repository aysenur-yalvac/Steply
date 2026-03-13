import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Github, Calendar, CheckCircle, Clock, Star } from 'lucide-react';
import { createReview } from '../../actions';
import FileSection from '@/components/projects/FileSection';
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
      profiles:student_id (full_name, email)
    `)
    .eq('id', projectId)
    .single();

  if (!project) notFound();

  type Review = {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles: { full_name: string } | null;
  };

  // Fetch reviews — joins profiles via reviewer_id FK
  // NOTE: Requires FK constraint: reviews.reviewer_id → profiles.id in Supabase
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at,
      profiles:reviewer_id ( full_name )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false }) as { data: Review[] | null; error: unknown };

  if (reviewsError) console.error('[Reviews fetch error]', reviewsError);

  const isCompleted = project.progress_percentage === 100;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
         <Link href="/dashboard" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white shrink-0">
           <ArrowLeft className="w-5 h-5" />
         </Link>
         <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{project.title}</h2>
            <p className="text-slate-400 text-sm">
              Developed by <span className="font-medium text-slate-300">{project.profiles?.full_name}</span>.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Project Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-xl font-bold text-white">About Project</h3>
               {isCompleted ? (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 shrink-0">
                   <CheckCircle className="w-4 h-4" /> Completed
                 </div>
               ) : (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium border border-amber-500/20 shrink-0">
                    <Clock className="w-4 h-4" /> In Progress
                 </div>
               )}
            </div>
            
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-8">
              {project.description || "No description has been entered for this project yet."}
            </p>

            <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              {project.github_link && (
                <a href={project.github_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  <Github className="w-5 h-5" /> GitHub Repository
                </a>
               )}
               <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <span className="text-sm">Start: {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US') : '-'}</span>
               </div>
               <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <span className="text-sm">End: {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US') : '-'}</span>
               </div>
            </div>
          </div>

          {/* File Management Section */}
          <FileSection 
            projectId={project.id} 
            initialFiles={(project.files as ProjectFile[]) || []} 
            isOwner={user.id === project.student_id} 
          />

          {/* Reviews List */}
          {reviews && reviews.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Teacher Evaluations</h3>
              {reviews.map((review: Review) => (
                <div key={review.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-medium text-slate-200">
                          {review.profiles?.full_name ?? 'Unknown Reviewer'}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex gap-1 text-amber-400 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-700'}`} />
                        ))}
                      </div>
                   </div>
                   <p className="text-slate-400 text-sm whitespace-pre-wrap">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Progress & Review Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
             <h3 className="font-bold text-white mb-4">Progress Status</h3>
             <div className="flex justify-between items-end mb-2">
                 <span className="text-3xl font-extrabold text-white">%{project.progress_percentage}</span>
             </div>
             <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${project.progress_percentage}%` }}
                />
             </div>
          </div>

          {/* Only teachers can comment */}
          {isTeacher && (
             <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-400" /> Evaluate
                </h3>
                <form action={createReview} className="flex flex-col gap-4">
                   <input type="hidden" name="project_id" value={project.id} />
                   
                   <div className="flex flex-col gap-2">
                     <label className="text-sm font-medium text-slate-300">Rating (1-5)</label>
                     <input 
                       type="number" 
                       name="rating" 
                       min="1" max="5" 
                       defaultValue="5"
                       className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors w-24"
                       required 
                     />
                   </div>

                   <div className="flex flex-col gap-2">
                     <label className="text-sm font-medium text-slate-300">Comment / Feedback</label>
                     <textarea 
                       name="comment" 
                       rows={4}
                       placeholder="Write your thoughts about the project..."
                       className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors resize-y"
                       required 
                     />
                   </div>

                   <button type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                     Submit Review
                   </button>

                   {error && (
                      <div className="mt-2 p-3 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg text-center">
                        {error}
                      </div>
                   )}
                </form>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
