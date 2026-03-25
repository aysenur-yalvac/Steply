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
      style={{ background: '#F8F9FA' }}
    >
      <DashboardSidebar
        userName={profile?.full_name}
        userEmail={user.email}
        role={role}
        unreadCount={unreadCount || 0}
        isTeacher={isTeacher}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
