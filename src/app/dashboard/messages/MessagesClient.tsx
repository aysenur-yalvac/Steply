"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, Send } from 'lucide-react';
import UserSearch from '@/components/social/UserSearch';
import ChatWindow from '@/components/social/ChatWindow';
import EmptyState from '@/components/layout/EmptyState';
import PageWrapper from '@/components/layout/PageWrapper';
import { StaggerContainer, StaggerItem } from '@/components/layout/StaggerContainer';
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
      <StaggerContainer className="flex-1 flex flex-col md:flex-row h-[calc(100vh-140px)] w-full max-w-6xl mx-auto border border-white/10 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-3xl shadow-floating">
        
        {/* Left Sidebar: Contact List */}
        <div className={`w-full md:w-80 border-r border-white/10 bg-white/[0.02] flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-white/5 space-y-5">
             <h2 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3 drop-shadow-sm">
               <MessageSquare className="w-6 h-6 text-indigo-400" strokeWidth={1.5} /> Inbox
             </h2>
             <UserSearch onSelectUser={handleSelectUser} placeholder="Search network..." />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {recentConversations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-light text-sm mt-4">
                No active conversations.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-3 mb-3 mt-2">Recent</h3>
                {recentConversations.map((conv) => (
                  <StaggerItem key={conv.other_user.id}>
                    <button
                      onClick={() => router.push(`/dashboard/messages?userId=${conv.other_user.id}`)}
                      className={`w-full text-left flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 ${selectedUser?.id === conv.other_user.id ? 'bg-indigo-500/20 border border-indigo-500/30 shadow-inner' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md">
                        <User className={`w-5 h-5 ${selectedUser?.id === conv.other_user.id ? 'text-indigo-300' : 'text-slate-400'}`} strokeWidth={1.25} />
                      </div>
                      <div className="flex flex-col overflow-hidden w-full pt-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold text-sm truncate tracking-wide ${selectedUser?.id === conv.other_user.id ? 'text-white' : 'text-slate-300'}`}>
                            {conv.other_user.full_name || 'Unnamed'}
                          </span>
                          {conv.last_message && (
                            <span className="text-[10px] font-bold text-slate-500 shrink-0">
                              {new Date(conv.last_message.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {conv.last_message && (
                          <span className="text-xs font-light text-slate-400 truncate pr-2">
                            {conv.last_message.sender_id === currentUser.id ? <span className="font-medium text-slate-500">You: </span> : ''}
                            {conv.last_message.content}
                          </span>
                        )}
                      </div>
                    </button>
                  </StaggerItem>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat or Placeholder */}
        <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'} bg-black/20`}>
           {selectedUser ? (
             <ChatWindow 
               currentUser={currentUser} 
               selectedUser={selectedUser} 
             />
           ) : (
             <StaggerItem className="h-full flex flex-col items-center justify-center p-6">
                <EmptyState 
                  icon={Send}
                  title="Your Inbox"
                  description="Select a person from the list on the left or search above to start a conversation. Realtime connectivity powers your engineering hub."
                />
             </StaggerItem>
           )}
        </div>

      </StaggerContainer>
    </PageWrapper>
  );
}
