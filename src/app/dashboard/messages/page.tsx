import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';
import { getRecentConversationsAction } from '@/lib/social-actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link 
        href="/dashboard" 
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors w-fit mb-4 ml-1"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </Link>
      <div className="flex-1 bg-white border border-slate-200/60 rounded-[2rem] shadow-xl shadow-rose-500/5 overflow-hidden">
        <MessagesClient 
          currentUser={currentUserProfile} 
          selectedUser={selectedUserProfile} 
          recentConversations={recentConversations} 
        />
      </div>
    </div>
  );
}
