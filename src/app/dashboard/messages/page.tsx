import { createAdminClient } from '@/utils/supabase/admin';
import { getCachedUser, getCachedProfile } from '@/lib/auth-cache';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';
import { getRecentConversationsAction } from '@/lib/social-actions';
import { BackButton } from '@/components/ui/back-button';

export default async function MessagesLayoutPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [user, resolvedSearchParams] = await Promise.all([
    getCachedUser(),
    searchParams,
  ]);
  if (!user) redirect('/auth/login');

  const selectedUserId = resolvedSearchParams?.userId as string | undefined;
  const adminClient = createAdminClient();

  // Parallel fetch: cached own profile, optional selected user profile, and recent conversations
  const [currentUserProfile, selectedUserRes, recentConversations] = await Promise.all([
    getCachedProfile(),
    selectedUserId
      ? adminClient
          .from('profiles')
          .select('*')
          .eq('id', selectedUserId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    getRecentConversationsAction(),
  ]);

  if (!currentUserProfile) redirect('/auth/login');
  if (selectedUserRes.error) {
    console.error("[MessagesLayoutPage] Selected user profile error:", selectedUserRes.error);
  }

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-3 sm:mb-4">
        <BackButton href="/dashboard" variant="light" />
      </div>
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-rose-500/5 overflow-hidden">
        <MessagesClient
          currentUser={{
            id: currentUserProfile.id,
            full_name: currentUserProfile.full_name || 'Kullanıcı',
            avatar_url: currentUserProfile.avatar_url,
            role: currentUserProfile.role,
            institution: currentUserProfile.institution,
          }}
          selectedUser={selectedUserRes.data as any}
          recentConversations={recentConversations}
        />
      </div>
    </div>
  );
}
