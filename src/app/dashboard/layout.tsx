import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  // Kullanıcı bilgisini ve profilini al
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'student';
  const roleName = role === 'student' ? 'Öğrenci' : 'Öğretmen';

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Hoş geldin, <span className="text-indigo-400 font-medium">{profile?.full_name || user.email}</span> ({roleName})
          </p>
        </div>
        <form action="/auth/logout" method="post">
           <button className="text-sm text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg font-medium">
             Çıkış Yap
           </button>
        </form>
      </div>
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}
