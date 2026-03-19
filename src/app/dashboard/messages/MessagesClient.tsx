"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, Send } from 'lucide-react';
import UserSearch from '@/components/social/UserSearch';
import ChatWindow from '@/components/social/ChatWindow';
import EmptyState from '@/components/layout/EmptyState';
import PageWrapper from '@/components/layout/PageWrapper';
import { Conversation, UserSearchResult } from '@/lib/social-actions';

interface CurrentUser {
  id: string;
  full_name: string;
}

interface MessagesClientProps {
  currentUser: CurrentUser;
  selectedUser: CurrentUser | null;
  recentConversations: Conversation[];
}

export default function MessagesClient({ currentUser, selectedUser, recentConversations }: MessagesClientProps) {
  const router = useRouter();

  const handleSelectUser = (user: UserSearchResult) => {
    router.push(`/dashboard/messages?userId=${user.id}`);
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col md:flex-row h-[80vh] min-h-[700px] w-[95vw] md:max-w-6xl mx-auto border border-slate-200/80 rounded-3xl overflow-hidden bg-white shadow-xl text-slate-900">
        
        {/* Left Sidebar: Contact List */}
        <div className={`w-full md:w-80 border-r border-slate-200/80 bg-slate-50 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3 bg-white">
             <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-dusty-rose" /> Inbox
             </h2>
             <UserSearch onSelectUser={handleSelectUser} placeholder="Search network..." />
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {recentConversations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm mt-4">
                No active conversations.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2">Recent</h3>
                {recentConversations.map((conv) => (
                  <button
                    key={conv.other_user.id}
                    onClick={() => router.push(`/dashboard/messages?userId=${conv.other_user.id}`)}
                    className={`w-full text-left flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 ${selectedUser?.id === conv.other_user.id ? 'bg-dusty-rose/10 border border-dusty-rose/20 shadow-sm' : 'hover:bg-slate-100/50 border border-transparent'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <User className={`w-5 h-5 ${selectedUser?.id === conv.other_user.id ? 'text-dusty-rose' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex flex-col overflow-hidden w-full">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`font-semibold text-sm truncate ${selectedUser?.id === conv.other_user.id ? 'text-slate-900' : 'text-slate-600'}`}>
                          {conv.other_user.full_name || 'Unnamed'}
                        </span>
                        {conv.last_message && (
                          <span className="text-[10px] font-medium text-slate-500 shrink-0">
                            {new Date(conv.last_message.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <span className="text-xs text-slate-400 truncate pr-2">
                          {conv.last_message.sender_id === currentUser.id ? <span className="font-medium">You: </span> : ''}
                          {conv.last_message.content}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat or Placeholder */}
        <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
           {selectedUser ? (
             <ChatWindow 
               currentUser={currentUser} 
               selectedUser={selectedUser} 
             />
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
               <Send className="w-12 h-12 text-slate-200 mb-4" />
               <h3 className="text-lg font-bold text-slate-700 mb-2">Your Inbox</h3>
               <p className="max-w-md">Select a person from the list on the left or search above to start a conversation. Realtime connectivity powers your engineering hub.</p>
             </div>
           )}
        </div>

      </div>
    </PageWrapper>
  );
}
