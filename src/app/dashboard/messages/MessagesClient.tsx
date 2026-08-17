
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, Send } from 'lucide-react';
import UserSearch from '@/components/social/UserSearch';
import ChatWindow from '@/components/social/ChatWindow';
import EmptyState from '@/components/layout/EmptyState';
import PageWrapper from '@/components/layout/PageWrapper';
import { Conversation, UserSearchResult, markMessagesAsReadAction } from '@/lib/social-actions';
import { createClient } from '@/utils/supabase/client';

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
  const [conversations, setConversations] = useState<Conversation[]>(recentConversations);
  const supabase = createClient();

  useEffect(() => {
    setConversations(recentConversations);
  }, [recentConversations]);

  const formatUnreadBadge = (count: number) => {
    if (count > 10) return '+10';
    return count.toString();
  };

  const handleSelectUser = (user: UserSearchResult) => {
    router.push(`/dashboard/messages?userId=${user.id}`);
  };

  useEffect(() => {
    // If a conversation is selected, mark it as read optimistically and in the DB
    if (selectedUser) {
      setConversations((prev) => {
        let chatMarkedAsRead = false;
        const next = prev.map((c) => {
          if (c.other_user.id === selectedUser.id && c.unread_count > 0) {
            chatMarkedAsRead = true;
            return { ...c, unread_count: 0 };
          }
          return c;
        });

        if (chatMarkedAsRead) {
          // Dispatch custom event to instantly update Sidebar badge globally
          window.dispatchEvent(new CustomEvent('unread_count_updated', { detail: { action: 'read_chat' } }));
        }

        return next;
      });

      // Let the ChatWindow or this handle the DB read, ChatWindow actually calls markMessagesAsReadAction
      // But we can just be sure and call it here.
      markMessagesAsReadAction(selectedUser.id).then((res) => {
        if (res.success) {
           router.refresh();
        }
      });
    }
  }, [selectedUser, router]);

  useEffect(() => {
    // Subscribe to new incoming messages
    const channel = supabase
      .channel('messages-client-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          
          setConversations((prev) => {
            const senderId = newMsg.sender_id;
            const existingConvIdx = prev.findIndex(c => c.other_user.id === senderId);
            
            // If the chat is currently open, it is instantly read.
            const isOpen = selectedUser?.id === senderId;

            if (existingConvIdx !== -1) {
              const updatedConv = { ...prev[existingConvIdx] };
              if (!isOpen) {
                if (updatedConv.unread_count === 0) {
                   window.dispatchEvent(new CustomEvent('unread_count_updated', { detail: { action: 'new_unread_chat' } }));
                }
                updatedConv.unread_count += 1;
              } else {
                 markMessagesAsReadAction(senderId);
              }
              const newConvs = [...prev];
              newConvs[existingConvIdx] = updatedConv;
              return newConvs;
            } else {
              // If it's a completely new conversation, fetch the user data or let router.refresh handle it.
              // For now, trigger a refresh to fetch the full conversation properly
              router.refresh();
              return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, selectedUser, router, supabase]);

  return (
    <PageWrapper className="overflow-hidden pb-0 mb-0">
      <div className="h-[calc(100vh-145px)] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl border border-slate-200/80 bg-white shadow-lg overflow-hidden text-slate-900">
        
        {/* Left Sidebar: Contact List */}
        <div className={`w-full md:w-80 border-r border-slate-200/80 bg-slate-50 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3 bg-white">
             <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-dusty-rose" /> Inbox
             </h2>
             <UserSearch onSelectUser={handleSelectUser} placeholder="Search network..." />
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm mt-4">
                No active conversations.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2">Recent</h3>
                {conversations.map((conv) => (
                  <button
                    key={conv.other_user.id}
                    onClick={() => router.push(`/dashboard/messages?userId=${conv.other_user.id}`)}
                    className={`w-full text-left flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 ${selectedUser?.id === conv.other_user.id ? 'bg-violet-50 dark:bg-zinc-800/80 border-l-4 border-l-indigo-600 text-indigo-950 dark:text-white font-medium shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50 border-l-4 border-transparent transition-colors'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <User className={`w-5 h-5 ${selectedUser?.id === conv.other_user.id ? 'text-dusty-rose' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex flex-col overflow-hidden w-full">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm truncate">{conv.other_user.full_name}</span>
                        {conv.last_message && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(conv.last_message.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {conv.last_message?.content || "Click to start chatting"}
                      </p>
                    </div>
                    {/* Unread Badge */}
                    {selectedUser?.id !== conv.other_user.id && conv.unread_count > 0 && (
                      <div className="ml-auto shrink-0 self-center bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                        {formatUnreadBadge(conv.unread_count)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Chat Window */}
        <div className={`flex-1 bg-white ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
          {selectedUser ? (
            <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Your Messages"
              description="Select a conversation or search for a user to start messaging."
            />
          )}
        </div>

      </div>
    </PageWrapper>
  );
}
