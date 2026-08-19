import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import NotificationBell from '@/components/dashboard/NotificationBell';
import type { Notification, LinkedAccount } from '@/lib/actions';
import { getLinkedAccountsAction } from '@/lib/actions';
import { ThemeToggle } from "@/components/ThemeToggle";
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications';

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

  const getProfile = unstable_cache(
    async (uid: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url, total_score')
        .eq('id', uid)
        .single();
      return data;
    },
    ['dashboard-profile'],
    { revalidate: 30 }
  );
  const profile = await getProfile(user.id);

  const role = profile?.role || 'student';
  const isTeacher = role === 'teacher';

  // Parallel fetch: messages + linked accounts
  const linkedAccountsResult = await getLinkedAccountsAction();
    const linkedAccounts: LinkedAccount[] = linkedAccountsResult || [];

  // Fetch notifications — graceful fallback if table not yet migrated
  let notifications: Notification[] = [];
  try {
    const { data: notifData } = await supabase
      .from('notifications')
      .select('id, type, title, body, is_read, related_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    notifications = (notifData || []) as Notification[];
  } catch {
    // notifications table not yet applied — silently degrade
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex"
      style={{ background: '#f5f3ff' }}
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
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Purple blobs — hidden on /dashboard, visible on all other sub-pages */}
        <DashboardBackground />

        {/* Top bar */}
        <div className="relative z-20 flex items-center justify-end gap-3 px-6 py-2 border-b border-slate-100 bg-white dark:bg-slate-900/70 backdrop-blur-sm shrink-0">

          <ThemeToggle />
          <NotificationBell initialNotifications={notifications} currentUserId={user.id} />
        </div>

        <div className="flex-1 overflow-y-auto relative z-10 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <footer className="shrink-0 py-3 text-center text-xs text-slate-400 border-t border-slate-100/80 bg-white dark:bg-slate-900/40 backdrop-blur-sm">
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
