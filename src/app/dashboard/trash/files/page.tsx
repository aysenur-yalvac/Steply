import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { restoreFileAction, permanentDeleteFileAction } from '@/lib/actions';
import EmptyState from '@/components/layout/EmptyState';
import { Trash2, FileIcon } from 'lucide-react';
import Link from 'next/link';

export default async function TrashFilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Dosyalar project_files değil, projects içindeki JSON'da! 
  // O yüzden veritabanındaki tüm projeleri çekip filter etmemiz gerekiyor (ya da SQL de query yapmalıyız).
  // Daha basit çözüm için admin üzerinden tüm user projelerini alıyoruz.
  const admin = createAdminClient();
  const { data: projects } = await admin
    .from('projects')
    .select('id, title, files')
    .eq('student_id', user?.id);

  let deletedFiles: any[] = [];
  (projects || []).forEach(p => {
    const files = (p.files as any[]) || [];
    files.forEach(f => {
      if (f.deleted_at) {
        deletedFiles.push({ ...f, projectId: p.id, projectName: p.title });
      }
    });
  });

  deletedFiles.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <a href="/dashboard/trash/projects" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium">Projeler</a>
        <a href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Dosyalar</a>
      </div>

      {deletedFiles.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Çöp kutusu boş"
          description="Silinmiş dosyanız bulunmuyor."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deletedFiles.map((file, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-slate-500 truncate">{file.projectName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={restoreFileAction.bind(null, file.projectId, file.url) as any}>
                  <button className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    Geri Yükle
                  </button>
                </form>
                <form action={permanentDeleteFileAction.bind(null, file.projectId, file.url) as any}>
                  <button className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    Kalıcı Sil
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
