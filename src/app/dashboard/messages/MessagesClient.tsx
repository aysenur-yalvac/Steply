"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare } from 'lucide-react';
import UserSearch from '@/components/social/UserSearch';
import ChatWindow from '@/components/social/ChatWindow';
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
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-140px)] w-full max-w-6xl mx-auto border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-2xl">
      
      {/* Left Sidebar: Contact List */}
      <div className={`w-full md:w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-800 space-y-4">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <MessageSquare className="w-5 h-5 text-indigo-500" /> Messages
           </h2>
           <UserSearch onSelectUser={handleSelectUser} placeholder="Search to start a chat..." />
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {recentConversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              No recent conversations. Search for a user above to start chatting!
            </div>
          ) : (
            <div className="flex flex-col gap-1 mt-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">Recent</h3>
              {recentConversations.map((conv) => (
                <button
                  key={conv.other_user.id}
                  onClick={() => router.push(`/dashboard/messages?userId=${conv.other_user.id}`)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors ${selectedUser?.id === conv.other_user.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col overflow-hidden w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium text-sm truncate ${selectedUser?.id === conv.other_user.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {conv.other_user.full_name || 'Unnamed'}
                      </span>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(conv.last_message.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <span className="text-xs text-slate-500 truncate">
                        {conv.last_message.sender_id === currentUser.id ? 'You: ' : ''}
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
           <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 p-6 text-center">
             <MessageSquare className="w-16 h-16 text-slate-800 mb-4" />
             <h3 className="text-xl font-bold text-slate-300 mb-2">Steply Messaging</h3>
             <p className="max-w-md text-sm">Start messaging by searching for a user or selecting a recent conversation.</p>
           </div>
         )}
      </div>

    </div>
  );
}
