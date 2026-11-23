import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCachedUser, getCachedProfile } from '@/lib/auth-cache';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import NotificationBell from '@/components/dashboard/NotificationBell';
import type { Notification, LinkedAccount } from '@/lib/actions';
import { getLinkedAccountsAction } from '@/lib/actions';
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();

  // Parallel fetch: profile (request-cached), linked accounts, and notifications
  const [profile, linkedAccountsResult, notifRes] = await Promise.all([
    getCachedProfile(),
    getLinkedAccountsAction().catch(() => [] as LinkedAccount[]),
    Promise.resolve(
      supabase
        .from('notifications')
        .select('id, type, title, content, link, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
    ).catch(() => ({ data: null })),
  ]);

  const role = profile?.role || 'student';
  const isTeacher = role === 'teacher';
  const linkedAccounts: LinkedAccount[] = linkedAccountsResult || [];

  const notifications: Notification[] = (((notifRes as any)?.data || []) as any[]).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.content ?? null,
    is_read: Boolean(n.is_read),
    related_id: n.link ?? null,
    created_at: n.created_at,
  })) as Notification[];

  return (
    <div
      className="fixed inset-0 h-[100dvh] z-[60] flex bg-[#f5f3ff] dark:bg-[#131927]"
    >
      <DashboardSidebar
        userName={profile?.full_name}
        userEmail={user.email}
        role={role}
        isTeacher={isTeacher}
        avatarUrl={profile?.avatar_url}
        linkedAccounts={linkedAccounts}
        userId={user.id}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        {/* Purple blobs — hidden on mobile, visible on desktop */}
        <DashboardBackground />

        {/* Top bar */}
        <div className="relative z-20 flex items-center justify-end gap-2 sm:gap-3 pl-16 lg:pl-6 pr-3 sm:pr-6 py-2 min-h-[56px] border-b border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 md:backdrop-blur-sm shrink-0">
          <ThemeToggle />
          <NotificationBell initialNotifications={notifications} currentUserId={user.id} />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-clip relative z-10 flex flex-col">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          <footer className="shrink-0 py-3 px-4 text-center text-xs text-slate-400 border-t border-slate-100/80 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 shrink-0">
            Powered by{' '}
            <a
              href="https://must-b.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-violet-400 hover:text-violet-600 transition-colors"
            >
              Must-b
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
