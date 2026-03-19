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
      <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200 p-6 md:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sticky top-0 z-40 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-1 leading-none">
            {isTeacher ? "All Student Projects" : "Community & Projects"}
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Welcome back, <span className="text-dusty-rose font-bold">{profile?.full_name || user.email}</span> <span className="text-slate-400 font-medium">({roleName})</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isTeacher && (
            <Link 
              href="/dashboard/projects/new" 
              className="flex items-center gap-2 bg-dusty-rose/10 hover:bg-dusty-rose/20 text-rose-600 font-bold px-5 py-2.5 rounded-2xl transition-all shadow-sm shrink-0 border border-dusty-rose/20"
            >
              <Plus className="w-5 h-5" /> New Project
            </Link>
          )}

          {!isTeacher && (
            <Link href="/dashboard/agenda" className="text-sm font-bold text-slate-500 hover:text-sage-green px-2 fallback-hidden sm:block transition-colors">
              Agenda
            </Link>
          )}

          <a href="/dashboard/messages" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-slate-600 bg-slate-100/50 hover:bg-slate-200/50 border border-slate-200/80 backdrop-blur-md transition-colors px-5 py-2.5 rounded-2xl font-bold relative">
            Messages
            {(unreadCount || 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-md px-1">
                {unreadCount}
              </span>
            )}
          </a>
        </div>
      </div>
      
      <div className="flex-1 w-full flex flex-col">
        <PageWrapper>
          {children}
        </PageWrapper>
      </div>
    </div>
  );
}
