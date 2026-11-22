
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, Send, Search, Loader2, X } from 'lucide-react';
import UserSearch from '@/components/social/UserSearch';
import ChatWindow from '@/components/social/ChatWindow';
import EmptyState from '@/components/layout/EmptyState';
import PageWrapper from '@/components/layout/PageWrapper';
import { Conversation, UserSearchResult, markMessagesAsReadAction, searchUsersAction } from '@/lib/social-actions';
import { createClient } from '@/utils/supabase/client';

interface CurrentUser {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role?: string | null;
  institution?: string | null;
}

interface MessagesClientProps {
  currentUser: CurrentUser;
  selectedUser: CurrentUser | null;
  recentConversations: Conversation[];
}

export default function MessagesClient({ currentUser, selectedUser, recentConversations }: MessagesClientProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(recentConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const supabase = createClient();

  // 250ms debounced user search with trim
  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsersAction(cleanQuery);
        if (res.error) {
          setSearchError(res.error);
          setSearchResults([]);
        } else {
          setSearchError(null);
          setSearchResults(res.users || []);
        }
      } catch (err: any) {
        console.error("[MessagesClient] User search failed:", err);
        setSearchError(err?.message || "Arama sırasında bir hata oluştu.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
          window.dispatchEvent(new CustomEvent('unread_chat_count_changed', { detail: { action: 'read_chat' } }));
        }

        return next;
      });

      // Let the ChatWindow or this handle the DB read, ChatWindow actually calls markMessagesAsReadAction
      // But we can just be sure and call it here.
      markMessagesAsReadAction(selectedUser.id).then((res) => {
        if (res.success) {
           router.refresh();
           if (typeof window !== "undefined") {
             window.dispatchEvent(new Event("unread_chat_count_changed"));
           }
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
                   window.dispatchEvent(new CustomEvent('unread_chat_count_changed', { detail: { action: 'new_unread_chat' } }));
                }
                updatedConv.unread_count += 1;
              } else {
                 markMessagesAsReadAction(senderId).then(() => {
                   if (typeof window !== "undefined") {
                     window.dispatchEvent(new Event("unread_chat_count_changed"));
                   }
                 });
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
      <div className="h-[calc(100vh-8.5rem)] min-h-[540px] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-lg overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Left Sidebar: Contact List */}
        <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex flex-col h-full min-h-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
             <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Mesajlar
             </h2>
             <div className="relative flex items-center">
               <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Kullanıcı ara..."
                 className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
               />
               {isSearching && (
                 <Loader2 className="w-4 h-4 absolute right-3 animate-spin text-violet-600 dark:text-violet-400" />
               )}
               {!isSearching && searchQuery.trim().length > 0 && (
                 <button
                   onClick={() => setSearchQuery('')}
                   className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                 >
                   <X className="w-4 h-4" />
                 </button>
               )}
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 p-3 custom-scrollbar">
            {searchQuery.trim().length >= 1 ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-3 mb-2 mt-1">
                  <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Kullanıcılar</h3>
                  <span className="text-[10px] text-slate-400">{searchResults.length} sonuç</span>
                </div>
                {searchError ? (
                  <div className="p-4 text-center text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/30 rounded-xl m-2 border border-red-200 dark:border-red-900/50">
                    {searchError}
                  </div>
                ) : isSearching && searchResults.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-600 dark:text-violet-400" /> Kullanıcılar aranıyor...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    "{searchQuery.trim()}" ile eşleşen kullanıcı bulunamadı.
                  </div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSearchQuery('');
                        router.push(`/dashboard/messages?userId=${u.id}`);
                      }}
                      className={`w-full text-left flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 ${selectedUser?.id === u.id ? 'bg-violet-50 dark:bg-violet-950/40 border-l-4 border-l-violet-600 text-violet-950 dark:text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border-l-4 border-transparent'}`}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-violet-100 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-violet-700 dark:text-violet-300 font-bold text-sm">
                          {(u.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden flex-1">
                        <span className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100">{u.full_name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          <span className="capitalize">{u.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}</span>
                          {u.institution && (
                            <>
                              <span>•</span>
                              <span className="truncate">{u.institution}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
                  Henüz aktif bir konuşma yok.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2">Son Konuşmalar</h3>
                  {conversations.map((conv) => (
                    <button
                      key={conv.other_user.id}
                      onClick={() => router.push(`/dashboard/messages?userId=${conv.other_user.id}`)}
                      className={`w-full text-left flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 ${selectedUser?.id === conv.other_user.id ? 'bg-violet-50 dark:bg-violet-950/40 border-l-4 border-l-violet-600 text-violet-950 dark:text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border-l-4 border-transparent'}`}
                    >
                      {conv.other_user.avatar_url ? (
                        <img
                          src={conv.other_user.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-violet-700 dark:text-violet-300 font-bold text-sm shadow-sm">
                          {(conv.other_user.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden w-full">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100">{conv.other_user.full_name}</span>
                          {conv.last_message && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {(conv.other_user.institution || conv.other_user.role) && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mb-0.5">
                            {conv.other_user.institution || (conv.other_user.role === 'teacher' ? 'Öğretmen' : 'Öğrenci')}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {conv.last_message?.content || "Sohbeti başlatmak için tıkla"}
                        </p>
                      </div>
                      {/* Unread Badge */}
                      {selectedUser?.id !== conv.other_user.id && conv.unread_count > 0 && (
                        <div className="ml-auto shrink-0 self-center bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                          {formatUnreadBadge(conv.unread_count)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Area: Chat Window */}
        <div className={`flex-1 bg-white dark:bg-slate-900 dark:bg-slate-900 ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
          {selectedUser ? (
            <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Mesajlarınız"
              description="Mesajlaşmaya başlamak için bir sohbet seçin veya bir kullanıcı arayın."
            />
          )}
        </div>

      </div>
    </PageWrapper>
  );
}




