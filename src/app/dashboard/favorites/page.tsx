import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import { Heart, FolderOpen, ExternalLink, CheckCircle, Clock, Minus } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import FavoriteHeart from '@/components/ui/FavoriteHeart';
import { BackButton } from '@/components/ui/back-button';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'teacher') redirect('/dashboard');

  const admin = createAdminClient();

  // Fetch favorited project IDs from project_favorites
  const { data: favRows } = await admin
    .from('project_favorites')
    .select('project_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const favIds = (favRows ?? []).map((r: any) => r.project_id as string);

  let projects: any[] = [];
  if (favIds.length > 0) {
    const { data } = await admin
      .from('projects')
      .select('id, title, description, progress_percentage, tags, student_id, profiles!student_id(full_name, avatar_url)')
      .in('id', favIds)
      .order('created_at', { ascending: false });
    projects = data ?? [];
  }

  function statusLabel(p: number) {
    if (p === 100) return 'completed';
    if (p > 0)     return 'inreview';
    return 'todo';
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white border-b border-slate-100 px-6 lg:px-8 py-5 lg:pt-8 pb-5">
        <div className="mb-3">
          <BackButton href="/dashboard" variant="light" />
        </div>
        <p className="text-xs font-semibold text-slate-400 mb-1">
          Dashboard <span className="text-slate-300 mx-1">›</span>
          <span className="text-slate-600 dark:text-slate-300">Favoriler</span>
        </p>
        <div className="flex items-center gap-3 mt-1">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
            <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Favoriler</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Kalplediğin öğrenci projeleri.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-8">
        {projects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 min-h-[280px] flex flex-col items-center justify-center gap-3 p-8">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Heart className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Henüz favori projen yok.</p>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Öğrenci profillerindeki ❤️ ikonuna tıklayarak projeleri buraya ekleyebilirsin.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-400 mb-5">
              {projects.length} proje favorilendi
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((p: any) => {
                const status = statusLabel(p.progress_percentage);
                const studentName   = p.profiles?.full_name  ?? 'Öğrenci';
                const studentAvatar = p.profiles?.avatar_url ?? null;
                const desc = (p.description ?? '').replace(/\[.*?\]/g, '').trim();

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                  >
                    <div className="p-5 flex flex-col flex-1 gap-3">
                      {/* Status + heart */}
                      <div className="flex items-center justify-between gap-2">
                        {status === 'completed' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-teal-50 text-teal-700 border-teal-200">
                            <CheckCircle className="w-3 h-3" /> Tamamlandı
                          </span>
                        ) : status === 'inreview' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 border-blue-200">
                            <Clock className="w-3 h-3" /> Devam Ediyor
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 dark:text-slate-400 border-slate-200">
                            <Minus className="w-3 h-3" /> Başlamadı
                          </span>
                        )}
                        {/* Heart toggle — removing from favorites */}
                        <FavoriteHeart projectId={p.id} initialFavorited={true} size="sm" />
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug line-clamp-2">
                        {p.title}
                      </h3>

                      {/* Description */}
                      {desc && (
                        <p className="text-xs text-slate-400 line-clamp-2 flex-1">{desc}</p>
                      )}

                      {/* Tags */}
                      {p.tags && p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(p.tags as string[]).slice(0, 3).map((t) => (
                            <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: student + link */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/user/${p.student_id}`}
                        className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        <Avatar src={studentAvatar} name={studentName} size="sm" className="w-6 h-6 text-[10px] shrink-0" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{studentName}</span>
                      </Link>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Görüntüle
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
