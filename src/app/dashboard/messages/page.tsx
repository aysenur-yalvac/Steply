import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, MessageSquare } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default async function MessagesLayoutPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const resolvedSearchParams = await searchParams;
  const selectedUserId = resolvedSearchParams?.userId as string | undefined;

  let messages = null;
  if (selectedUserId) {
    const { data: fetchMsgs } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    messages = fetchMsgs;
  }

  // Retrieve all profiles except current user to show in sidebar
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .neq('id', user.id)
    .order('full_name', { ascending: true });

  // Compute unread counts grouped by sender
  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  const unreadCounts: Record<string, number> = {};
  if (unreadMessages) {
    unreadMessages.forEach((msg) => {
      unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1;
    });
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-140px)] w-full max-w-6xl mx-auto border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-2xl">
      
      {/* Sol Sidebar: Kişi Listesi */}
      <div className={`w-full md:w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-800">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-indigo-500" /> Mesajlar
           </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {profiles?.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">Kullanıcı bulunamadı.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {profiles?.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/dashboard/messages?userId=${profile.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${selectedUserId === profile.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-medium text-sm ${selectedUserId === profile.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {profile.full_name || 'İsimsiz'}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">{profile.role}</span>
                    </div>
                  </div>
                  {unreadCounts[profile.id] > 0 && (
                     <div className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                       {unreadCounts[profile.id]}
                     </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Taraf: Chat veya Placeholder */}
      <div className={`flex-1 flex flex-col ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
         {selectedUserId ? (
           <ChatWindow 
             currentUserId={user.id} 
             selectedUserId={selectedUserId} 
             selectedUserName={profiles?.find(p => p.id === selectedUserId)?.full_name || 'İsimsiz'}
             initialMessages={messages || []}
           />
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 p-6 text-center">
             <MessageSquare className="w-16 h-16 text-slate-800 mb-4" />
             <h3 className="text-xl font-bold text-slate-300 mb-2">Steply Mesajlaşma</h3>
             <p className="max-w-md text-sm">Soldaki listeden bir kişiyi seçerek mesajlaşmaya başlayın. Gönderdiğiniz mesajlar anında karşı tarafa iletilecektir.</p>
           </div>
         )}
      </div>

    </div>
  );
}
