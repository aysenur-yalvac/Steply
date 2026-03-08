import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createProject } from '../actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Only allowed for students
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'student') {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      
      <div className="flex items-center gap-4 mb-2">
         <Link href="/dashboard" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
           <ArrowLeft className="w-5 h-5" />
         </Link>
         <h2 className="text-2xl font-bold text-white">Yeni Proje Ekle</h2>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <form action={createProject} className="flex flex-col gap-6 text-slate-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="title">Proje Başlığı</label>
              <input
                className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                name="title"
                placeholder="Örn: Steply Proje Yönetim Sistemi"
                required
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="description">Açıklama</label>
              <textarea
                className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors min-h-[120px] resize-y"
                name="description"
                placeholder="Projenin amacı, kullanılan teknolojiler ve kapsamı hakkında bilgi..."
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="github_link">GitHub Linki</label>
              <input
                className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                name="github_link"
                type="url"
                placeholder="https://github.com/kullanici/repo"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="start_date">Başlangıç Tarihi</label>
              <input
                className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                name="start_date"
                type="date"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="end_date">Bitiş Tarihi</label>
              <input
                className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                name="end_date"
                type="date"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium" htmlFor="progress_percentage">Başlangıç İlerleme Yüzdesi</label>
                <span className="text-indigo-400 text-sm font-medium px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20" id="progress-val">
                  0%
                </span>
              </div>
              <input
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none mt-2"
                name="progress_percentage"
                type="range"
                min="0"
                max="100"
                step="5"
                defaultValue="0"
                onChange={(e) => {
                  const val = document.getElementById('progress-val');
                  if (val) val.innerText = `${e.target.value}%`;
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-800">
             <Link href="/dashboard" className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
               İptal
             </Link>
             <button
               type="submit"
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)]"
             >
               Projeyi Başlat
             </button>
          </div>

          {error && (
            <div className="mt-4 p-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg text-center">
              {error}
            </div>
          )}
        </form>
      </div>

    </div>
  );
}
