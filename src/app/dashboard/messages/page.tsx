import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';
import { getRecentConversationsAction } from '@/lib/social-actions';

export default async function MessagesLayoutPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single();

  if (!currentUserProfile) redirect('/auth/login');

  const resolvedSearchParams = await searchParams;
  const selectedUserId = resolvedSearchParams?.userId as string | undefined;

  let selectedUserProfile = null;
  if (selectedUserId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', selectedUserId)
      .single();
    if (data) selectedUserProfile = data;
  }

  const recentConversations = await getRecentConversationsAction();

  return (
    <MessagesClient 
      currentUser={currentUserProfile} 
      selectedUser={selectedUserProfile} 
      recentConversations={recentConversations} 
    />
  );
}
