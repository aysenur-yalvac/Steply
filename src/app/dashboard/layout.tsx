import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';

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
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isTeacher ? "All Student Projects" : "My Projects"}
          </h2>
          <p className="text-sm text-slate-400">
            Welcome back, <span className="text-indigo-400 font-medium">{profile?.full_name || user.email}</span> ({roleName})
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isTeacher && ( // Only show "New Project" for teachers
            <Link 
              href="/dashboard/projects/new" 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)] shrink-0"
            >
              <Plus className="w-5 h-5" /> New Project
            </Link>
          )}
          <a href="/dashboard/messages" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors px-4 py-2 rounded-lg font-medium relative">
            Messages
            {(unreadCount || 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </a>
          <form action="/auth/logout" method="post" className="flex-1 sm:flex-none">
             <button className="w-full text-sm text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg font-medium border border-red-500/20">
               Sign Out
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
