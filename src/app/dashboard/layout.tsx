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

  const { count: unreadCount } = await supabase
    .from("messages")
    .select("id", { count: 'exact', head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Hoş geldin, <span className="text-indigo-400 font-medium">{profile?.full_name || user.email}</span> ({roleName})
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a href="/dashboard/messages" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors px-4 py-2 rounded-lg font-medium relative">
            Mesajlar
            {(unreadCount || 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </a>
          <form action="/auth/logout" method="post" className="flex-1 sm:flex-none">
             <button className="w-full text-sm text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg font-medium border border-red-500/20">
               Çıkış Yap
             </button>
          </form>
        </div>
      </div>
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}
