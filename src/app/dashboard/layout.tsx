import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

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
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'student';
  const isTeacher = role === 'teacher';

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

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
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Animated purple blobs — visible on every dashboard page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-40 w-[580px] h-[580px] rounded-full opacity-[0.18] blur-3xl blob-spin-slow"
          style={{ background: 'radial-gradient(circle at 40% 40%, #7C3AFF 0%, #a855f7 45%, transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.12] blur-3xl blob-spin-slower"
          style={{ background: 'radial-gradient(circle at 60% 60%, #6d28d9 0%, #c026d3 50%, transparent 70%)' }}
        />

        <div className="flex-1 overflow-y-auto relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
