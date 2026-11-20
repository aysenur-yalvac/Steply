import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';
import { getRecentConversationsAction } from '@/lib/social-actions';
import { BackButton } from '@/components/ui/back-button';

export default async function MessagesLayoutPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  let adminClient: any = supabase;
  try {
    adminClient = createAdminClient();
  } catch {
    adminClient = supabase;
  }

  const { data: currentUserProfile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!currentUserProfile) redirect('/auth/login');

  const resolvedSearchParams = await searchParams;
  const selectedUserId = resolvedSearchParams?.userId as string | undefined;

  let selectedUserProfile = null;
  if (selectedUserId) {
    const { data, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', selectedUserId)
      .single();
    if (data) selectedUserProfile = data;
    if (error) console.error("[MessagesLayoutPage] Selected user profile error:", error);
  }

  const recentConversations = await getRecentConversationsAction();

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <BackButton href="/dashboard" variant="light" />
      </div>
      <div className="flex-1 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-800/60 rounded-[2rem] shadow-xl shadow-rose-500/5 overflow-hidden">
        <MessagesClient 
          currentUser={currentUserProfile} 
          selectedUser={selectedUserProfile} 
          recentConversations={recentConversations} 
        />
      </div>
    </div>
  );
}
