
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, Send, Search, Loader2, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import UserSearch from '@/components/social/UserSearch';
import ChatWindow from '@/components/social/ChatWindow';
import EmptyState from '@/components/layout/EmptyState';
import PageWrapper from '@/components/layout/PageWrapper';
import {
  Conversation,
  UserSearchResult,
  markMessagesAsReadAction,
  searchUsersAction,
  deleteConversationAction,
  getLatestMessageBetweenUsersAction,
  getConversationWithUserAction,
  Message,
} from '@/lib/social-actions';
import { createClient } from '@/utils/supabase/client';
import { isImageAttachment, parseContentWithAttachment } from '@/lib/chat-attachments';

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
  const [activeUser, setActiveUser] = useState<CurrentUser | null>(selectedUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [confirmDeleteConv, setConfirmDeleteConv] = useState<Conversation | null>(null);
  const [isDeletingConv, setIsDeletingConv] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setActiveUser(selectedUser);
  }, [selectedUser]);

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

  const handleSelectUser = (user: CurrentUser) => {
    setActiveUser(user);
    if (typeof window !== 'undefined') {
      const nextUrl = `/dashboard/messages?userId=${encodeURIComponent(user.id)}`;
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  };

  useEffect(() => {
    // If a conversation is selected, mark it as read optimistically and in the DB in the background
    if (activeUser) {
      setConversations((prev) => {
        let chatMarkedAsRead = false;
        const next = prev.map((c) => {
          if (c.other_user.id === activeUser.id && c.unread_count > 0) {
            chatMarkedAsRead = true;
            return { ...c, unread_count: 0 };
          }
          return c;
        });

        if (chatMarkedAsRead && typeof window !== 'undefined') {
          // Dispatch custom event to instantly update Sidebar badge globally
          window.dispatchEvent(new CustomEvent('unread_chat_count_changed', { detail: { action: 'read_chat' } }));
        }

        return next;
      });

      void markMessagesAsReadAction(activeUser.id).then((res) => {
        if (res.success && typeof window !== "undefined") {
          window.dispatchEvent(new Event("unread_chat_count_changed"));
        }
      });
    }
  }, [activeUser]);

  const handleUpdateLastMessage = useCallback((newMsg: Message) => {
    if (!newMsg?.id) return;
    const isSender = newMsg.sender_id === currentUser.id;
    const otherId = isSender ? newMsg.receiver_id : newMsg.sender_id;
    if (!otherId) return;

    setConversations((prev) => {
      const existingConvIdx = prev.findIndex((c) => c.other_user.id === otherId);
      const isOpen = activeUser?.id === otherId;

      if (existingConvIdx !== -1) {
        const existingConv = prev[existingConvIdx];
        const updatedConv: Conversation = {
          ...existingConv,
          last_message: newMsg,
          unread_count:
            !isSender && !isOpen
              ? existingConv.unread_count + 1
              : isOpen
              ? 0
              : existingConv.unread_count,
        };

        if (!isSender && !isOpen && existingConv.unread_count === 0 && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('unread_chat_count_changed', {
              detail: { action: 'new_unread_chat' },
            })
          );
        }

        if (isOpen && !isSender) {
          void markMessagesAsReadAction(otherId).then(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('unread_chat_count_changed'));
            }
          });
        }

        // En son mesajlaşılan kişiyi listenin en üstüne taşı
        const others = prev.filter((_, idx) => idx !== existingConvIdx);
        return [updatedConv, ...others];
      } else {
        // Yeni bir kullanıcıdan ilk mesaj geldiğinde listeye ekle ve en üste koy
        void getConversationWithUserAction(otherId).then((newConv) => {
          if (newConv) {
            newConv.last_message = newMsg;
            if (!isSender && !isOpen) newConv.unread_count = 1;
            setConversations((curr) => {
              if (curr.some((c) => c.other_user.id === otherId)) return curr;
              return [newConv, ...curr];
            });
          }
        });
        return prev;
      }
    });
  }, [currentUser.id, activeUser?.id]);

  const handleMessageDeleted = useCallback((deletedMsgId: string, otherUserId?: string) => {
    if (!deletedMsgId) return;
    setConversations((prev) => {
      const targetConv = prev.find(
        (c) => c.last_message?.id === deletedMsgId || (otherUserId && c.other_user.id === otherUserId)
      );
      if (!targetConv) return prev;

      const targetId = targetConv.other_user.id;
      void getLatestMessageBetweenUsersAction(targetId).then((latestMsg) => {
        setConversations((curr) => {
          if (!latestMsg) {
            // İki kullanıcı arasında mesaj kalmadıysa sohbeti listeden tamamen kaldır
            return curr.filter((c) => c.other_user.id !== targetId);
          }
          return curr.map((c) =>
            c.other_user.id === targetId ? { ...c, last_message: latestMsg } : c
          );
        });
      });

      return prev;
    });
  }, []);

  const handleConfirmDeleteConv = async () => {
    if (!confirmDeleteConv) return;
    const targetId = confirmDeleteConv.other_user.id;
    setIsDeletingConv(true);
    try {
      const res = await deleteConversationAction(targetId);
      if (!res.success) {
        toast.error(res.error || "Sohbet silinemedi.");
        return;
      }

      setConversations((prev) => prev.filter((c) => c.other_user.id !== targetId));
      if (activeUser?.id === targetId) {
        setActiveUser(null);
        router.push("/dashboard/messages");
      }
      setConfirmDeleteConv(null);
      toast.success("Sohbet kalıcı olarak silindi.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("conversation_deleted", {
            detail: { otherUserId: targetId },
          })
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Sohbet silinemedi.");
    } finally {
      setIsDeletingConv(false);
    }
  };

  useEffect(() => {
    // 1. Supabase Realtime ile gelen, giden ve silinen mesajları dinle
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
          handleUpdateLastMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUser.id}`,
        },
        (payload) => {
          handleUpdateLastMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const oldMsg = payload.old as { id?: string; sender_id?: string; receiver_id?: string };
          if (oldMsg?.id) {
            const partnerId = oldMsg.sender_id === currentUser.id ? oldMsg.receiver_id : oldMsg.sender_id;
            handleMessageDeleted(oldMsg.id, partnerId);
          }
        }
      )
      .subscribe();

    // 2. Yerel sekme için anlık (0ms) custom DOM olaylarını dinle
    const onChatMessageSent = (e: any) => {
      if (e.detail?.message) {
        handleUpdateLastMessage(e.detail.message);
      }
    };

    const onChatMessageDeleted = (e: any) => {
      if (e.detail?.messageId) {
        handleMessageDeleted(e.detail.messageId, e.detail?.otherUserId);
      }
    };

    const onConversationDeleted = (e: any) => {
      const otherUserId = e.detail?.otherUserId;
      if (otherUserId) {
        setConversations((prev) => prev.filter((c) => c.other_user.id !== otherUserId));
        if (activeUser?.id === otherUserId) {
          setActiveUser(null);
          router.push('/dashboard/messages');
        }
      }
    };

    window.addEventListener('chat_message_sent', onChatMessageSent);
    window.addEventListener('chat_message_deleted', onChatMessageDeleted);
    window.addEventListener('conversation_deleted', onConversationDeleted);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('chat_message_sent', onChatMessageSent);
      window.removeEventListener('chat_message_deleted', onChatMessageDeleted);
      window.removeEventListener('conversation_deleted', onConversationDeleted);
    };
  }, [currentUser.id, supabase, handleUpdateLastMessage, handleMessageDeleted, activeUser?.id, router]);

  return (
    <PageWrapper className="overflow-hidden pb-0 mb-0">
      <div className="h-[calc(100dvh-6.5rem)] sm:h-[calc(100vh-8.5rem)] min-h-[460px] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Left Sidebar: Contact List */}
        <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex flex-col h-full min-h-0 ${activeUser ? 'hidden md:flex' : 'flex'}`}>
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
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        handleSelectUser({
                          id: u.id,
                          full_name: u.full_name,
                          avatar_url: u.avatar_url,
                          role: u.role,
                          institution: u.institution,
                        });
                      }}
                      className={`w-full text-left flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${activeUser?.id === u.id ? 'bg-violet-50 dark:bg-violet-950/40 border-l-4 border-l-violet-600 text-violet-950 dark:text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border-l-4 border-transparent'}`}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 pointer-events-none" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-violet-100 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-violet-700 dark:text-violet-300 font-bold text-sm pointer-events-none">
                          {(u.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden flex-1 pointer-events-none">
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
                    <div
                      key={conv.other_user.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleSelectUser({
                          id: conv.other_user.id,
                          full_name: conv.other_user.full_name,
                          avatar_url: conv.other_user.avatar_url,
                          role: conv.other_user.role,
                          institution: conv.other_user.institution,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectUser({
                            id: conv.other_user.id,
                            full_name: conv.other_user.full_name,
                            avatar_url: conv.other_user.avatar_url,
                            role: conv.other_user.role,
                            institution: conv.other_user.institution,
                          });
                        }
                      }}
                      className={`group w-full text-left flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${activeUser?.id === conv.other_user.id ? 'bg-violet-50 dark:bg-violet-950/40 border-l-4 border-l-violet-600 text-violet-950 dark:text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border-l-4 border-transparent'}`}
                    >
                      {conv.other_user.avatar_url ? (
                        <img
                          src={conv.other_user.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-none"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-violet-700 dark:text-violet-300 font-bold text-sm shadow-sm pointer-events-none">
                          {(conv.other_user.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden w-full pointer-events-none">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100">{conv.other_user.full_name}</span>
                          {conv.last_message?.created_at && (
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
                          {(() => {
                            if (!conv.last_message?.content) return "Sohbeti başlatmak için tıkla";
                            const parsed = parseContentWithAttachment(
                              conv.last_message.content,
                              conv.last_message.metadata
                            );
                            let preview = "";
                            if (parsed.text && parsed.attachment) {
                              preview = `${isImageAttachment(parsed.attachment) ? "📷 " : "📎 "}${parsed.text}`;
                            } else if (parsed.text) {
                              preview = parsed.text;
                            } else if (parsed.attachment) {
                              preview = isImageAttachment(parsed.attachment)
                                ? "📷 Görsel"
                                : `📎 ${parsed.attachment.name}`;
                            } else {
                              preview = conv.last_message.content;
                            }
                            return conv.last_message.sender_id === currentUser.id
                              ? `Sen: ${preview}`
                              : preview;
                          })()}
                        </p>
                      </div>
                      {/* Unread Badge & Delete action */}
                      <div className="ml-auto shrink-0 flex items-center gap-1.5 self-center">
                        {activeUser?.id !== conv.other_user.id && conv.unread_count > 0 && (
                          <div className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm pointer-events-none">
                            {formatUnreadBadge(conv.unread_count)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteConv(conv);
                          }}
                          className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Sohbeti Sil"
                          aria-label="Sohbeti Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Area: Chat Window */}
        <div className={`flex-1 min-w-0 h-full bg-white dark:bg-slate-900 ${activeUser ? 'flex' : 'hidden md:flex'}`}>
          {activeUser ? (
            <ChatWindow
              currentUser={currentUser}
              selectedUser={activeUser}
              onBack={() => {
                setActiveUser(null);
                router.push('/dashboard/messages');
              }}
              onConversationDeleted={(deletedUserId) => {
                setConversations((prev) => prev.filter((c) => c.other_user.id !== deletedUserId));
                setActiveUser(null);
                router.push('/dashboard/messages');
              }}
              onMessageSent={(msg) => {
                handleUpdateLastMessage(msg);
              }}
              onMessageDeleted={(msgId) => {
                handleMessageDeleted(msgId, activeUser?.id);
              }}
            />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Mesajlarınız"
              description="Mesajlaşmaya başlamak için bir sohbet seçin veya bir kullanıcı arayın."
            />
          )}
        </div>

      </div>

      {/* Sohbeti Kalıcı Olarak Silme Modalı (Sohbet Listesi İçin) */}
      {confirmDeleteConv && (
        <div
          className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeletingConv && setConfirmDeleteConv(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Sohbeti Kalıcı Olarak Sil</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tüm sohbet geçmişi temizlenir.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-100">
                {confirmDeleteConv.other_user.full_name}
              </strong>{" "}
              ile olan tüm mesajlaşma geçmişiniz kalıcı olarak silinecektir. Bu işlem geri alınamaz ve bu kişi sohbet listenizden tamamen kaldırılacaktır.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingConv}
                onClick={() => setConfirmDeleteConv(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isDeletingConv}
                onClick={handleConfirmDeleteConv}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeletingConv ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Sohbeti Kalıcı Olarak Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}




