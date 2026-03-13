import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';

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

  // Get user info and profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'student';
  const roleName = role === 'student' ? 'Student' : 'Teacher';
  const isTeacher = role === 'teacher';

  const { count: unreadCount } = await supabase
    .from("messages")
    .select("id", { count: 'exact', head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sleeker Navbar Area with Glassmorphism */}
      <div className="bg-slate-900/40 backdrop-blur-2xl border-b border-slate-800/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-40 shadow-soft">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            {isTeacher ? "All Student Projects" : "Community & Projects"}
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Welcome back, <span className="text-indigo-400">{profile?.full_name || user.email}</span> <span className="text-slate-500 font-normal">({roleName})</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isTeacher && (
            <Link 
              href="/dashboard/projects/new" 
              className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium px-5 py-2.5 rounded-2xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)] shrink-0 border border-indigo-500/20 hover:border-indigo-500/40"
            >
              <Plus className="w-5 h-5" /> New Project
            </Link>
          )}
          <a href="/dashboard/messages" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-slate-300 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 backdrop-blur-md transition-colors px-5 py-2.5 rounded-2xl font-medium relative">
            Messages
            {(unreadCount || 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-red-400">
                {unreadCount}
              </span>
            )}
          </a>
          <form action="/auth/logout" method="post" className="flex-1 sm:flex-none">
             <button className="w-full text-sm text-red-400/80 hover:text-red-300 transition-colors bg-red-500/5 hover:bg-red-500/10 px-5 py-2.5 rounded-2xl font-medium border border-red-500/10 hover:border-red-500/30">
               Sign Out
             </button>
          </form>
        </div>
      </div>
      
      <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full">
        <PageWrapper>
          {children}
        </PageWrapper>
      </div>
    </div>
  );
}
