const fs = require('fs');
const path = require('path');

const trashLayout = `import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çöp Kutusu | Steply",
};

export default function TrashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Çöp Kutusu</h1>
            <p className="text-sm text-slate-500 mt-1">
              Silinmiş projeleriniz ve dosyalarınız burada yer alır.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
`;

const trashProjects = `import { createClient } from '@/utils/supabase/server';
import { restoreProjectAction, permanentDeleteProjectAction } from '@/lib/actions';
import ProjectCard from '@/app/dashboard/ProjectCard';
import EmptyState from '@/components/layout/EmptyState';
import { Trash2 } from 'lucide-react';

export default async function TrashProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('*, profiles!student_id(full_name, avatar_url, is_public)')
    .not('deleted_at', 'is', null)
    .eq('student_id', user?.id)
    .order('deleted_at', { ascending: false });

  const items = projects || [];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <a href="/dashboard/trash/projects" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Projeler</a>
        <a href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium">Dosyalar</a>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Çöp kutusu boş"
          description="Silinmiş projeniz bulunmuyor."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((project: any) => (
            <div key={project.id} className="relative group">
              <div className="pointer-events-none opacity-50">
                <ProjectCard project={project} isOwner={true} />
              </div>
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <form action={restoreProjectAction.bind(null, project.id)}>
                  <button className="px-4 py-2 bg-white text-slate-800 rounded-xl font-medium shadow-sm hover:shadow-md transition-all text-sm w-36">
                    Geri Yükle
                  </button>
                </form>
                <form action={permanentDeleteProjectAction.bind(null, project.id)}>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium shadow-sm hover:bg-red-700 transition-all text-sm w-36">
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
`;

const trashFiles = `import { createClient } from '@/utils/supabase/server';
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
                <form action={restoreFileAction.bind(null, file.projectId, file.url)}>
                  <button className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    Geri Yükle
                  </button>
                </form>
                <form action={permanentDeleteFileAction.bind(null, file.projectId, file.url)}>
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
`;

fs.mkdirSync('src/app/dashboard/trash/projects', { recursive: true });
fs.mkdirSync('src/app/dashboard/trash/files', { recursive: true });
fs.writeFileSync('src/app/dashboard/trash/layout.tsx', trashLayout, 'utf8');
fs.writeFileSync('src/app/dashboard/trash/projects/page.tsx', trashProjects, 'utf8');
fs.writeFileSync('src/app/dashboard/trash/files/page.tsx', trashFiles, 'utf8');

console.log('Pages created!');
