import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import NotificationBell from '@/components/dashboard/NotificationBell';
import type { Notification, LinkedAccount } from '@/lib/actions';
import { getLinkedAccountsAction } from '@/lib/actions';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url, total_score')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'student';
  const isTeacher = role === 'teacher';

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  // Fetch linked accounts — graceful fallback if table not yet migrated
  let linkedAccounts: LinkedAccount[] = [];
  try { linkedAccounts = await getLinkedAccountsAction(); } catch { /* table not yet applied */ }

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
        unreadCount={unreadCount || 0}
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
        <div className="relative z-20 flex items-center justify-end gap-3 px-6 py-2 border-b border-slate-100 bg-white/70 backdrop-blur-sm shrink-0">
          {((profile as any)?.total_score ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm shadow-amber-200/50 select-none">
              🏆 {((profile as any).total_score as number).toLocaleString('tr-TR')} puan
            </span>
          )}
          <NotificationBell initialNotifications={notifications} currentUserId={user.id} />
        </div>

        <div className="flex-1 overflow-y-auto relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
