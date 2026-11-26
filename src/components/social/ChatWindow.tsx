"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Send,
  Loader2,
  FolderRoot,
  ArrowLeft,
  Paperclip,
  FileText,
  Download,
  X,
  Trash2,
} from "lucide-react";
import {
  getMessagesAction,
  sendMessageAction,
  getUserProjectsAction,
  deleteMessageAction,
  deleteConversationAction,
  Message,
} from "@/lib/social-actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import {
  ACCEPTED_CHAT_FILES,
  ChatAttachment,
  downloadAttachment,
  encodeContentWithAttachment,
  formatAttachmentSize,
  isImageAttachment,
  parseContentWithAttachment,
  uploadChatAttachment,
} from "@/lib/chat-attachments";
import { renderMessageWithLinks } from "@/lib/linkify";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface User {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role?: string | null;
  institution?: string | null;
  university?: string | null;
}

interface ChatWindowProps {
  currentUser: User;
  selectedUser: User;
  onBack?: () => void;
  onConversationDeleted?: (userId: string) => void;
  onMessageSent?: (msg: Message) => void;
  onMessageDeleted?: (msgId: string) => void;
}

function ChatImageAttachment({
  url,
  name,
  onClick,
}: {
  url: string;
  name: string;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block rounded-xl overflow-hidden border border-white/20 hover:opacity-95 transition-opacity max-w-full cursor-pointer"
      title="Görseli büyütmek için tıklayın"
    >
      {!loaded && (
        <div className="w-56 h-36 flex items-center justify-center bg-black/15 dark:bg-white/10 animate-pulse rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin opacity-75" />
        </div>
      )}
      <img
        src={url}
        alt={name}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`max-h-60 w-auto max-w-full object-contain rounded-xl bg-black/5 transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0 absolute inset-0"
        }`}
      />
    </button>
  );
}

// Module-level in-memory caches for instant (0ms) conversation switching
const messagesMemoryCache = new Map<string, Message[]>();
const userProjectsCache = new Map<string, { id: string; title: string }[]>();

export default function ChatWindow({
  currentUser,
  selectedUser,
  onBack,
  onConversationDeleted,
  onMessageSent,
  onMessageDeleted,
}: ChatWindowProps) {
  const cacheKey = `${currentUser.id}:${selectedUser.id}`;
  const [messages, setMessages] = useState<Message[]>(() => messagesMemoryCache.get(cacheKey) ?? []);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(() => !messagesMemoryCache.has(cacheKey));
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // Kalıcı mesaj ve sohbet silme modal state'leri
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [isDeletingMsg, setIsDeletingMsg] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const scrollToBottomInstant = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const forceScrollToBottomInstant = () => {
    scrollToBottomInstant();
    requestAnimationFrame(() => {
      scrollToBottomInstant();
      requestAnimationFrame(() => {
        scrollToBottomInstant();
      });
    });
    setTimeout(scrollToBottomInstant, 40);
    setTimeout(scrollToBottomInstant, 120);
  };

  const scrollToBottomSmooth = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollToBottom = (instant = false) => {
    if (instant || isInitialLoadRef.current) {
      forceScrollToBottomInstant();
    } else {
      scrollToBottomSmooth();
    }
  };

  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [selectedUser.id]);

  useIsomorphicLayoutEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0) {
      forceScrollToBottomInstant();
    }
  }, [messages, selectedUser.id]);

  const updateMessagesWithCache = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    setMessages((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      messagesMemoryCache.set(`${currentUser.id}:${selectedUser.id}`, next);
      return next;
    });
  };

  const focusMessageTextarea = () => {
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 30);
  };

  useEffect(() => {
    if (!isSending && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      focusMessageTextarea();
    }
  }, [isSending]);

  // Mention State
  const [projects, setProjects] = useState<{ id: string; title: string }[]>(
    () => userProjectsCache.get(currentUser.id) ?? []
  );
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionedProject, setMentionedProject] = useState<{ id: string; title: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let active = true;
    const currentKey = `${currentUser.id}:${selectedUser.id}`;
    const cached = messagesMemoryCache.get(currentKey);

    if (cached) {
      setMessages(cached);
      setIsLoading(false);
      forceScrollToBottomInstant();
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 200);
    } else {
      setMessages([]);
      setIsLoading(true);
    }

    const loadMessages = async () => {
      try {
        // Direct single query for the latest 50 messages without extra server roundtrips
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, receiver_id, content, is_read, metadata, created_at")
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
          )
          .order("created_at", { ascending: false })
          .limit(50);

        if (!active) return;

        if (!error && data) {
          const ordered = (data as Message[]).slice().reverse();
          messagesMemoryCache.set(currentKey, ordered);
          setMessages(ordered);
        } else {
          const fallback = await getMessagesAction(selectedUser.id);
          if (!active) return;
          messagesMemoryCache.set(currentKey, fallback);
          setMessages(fallback);
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        if (active) {
          setIsLoading(false);
          forceScrollToBottomInstant();
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 200);
        }
      }
    };

    void loadMessages();

    if (!userProjectsCache.has(currentUser.id)) {
      getUserProjectsAction()
        .then((data) => {
          const list = data || [];
          userProjectsCache.set(currentUser.id, list);
          if (active) setProjects(list);
        })
        .catch((error) => {
          console.error("Failed to load projects for mentions", error);
        });
    } else {
      setProjects(userProjectsCache.get(currentUser.id) ?? []);
    }

    const syncLatestMessages = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, receiver_id, content, is_read, metadata, created_at")
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
          )
          .order("created_at", { ascending: false })
          .limit(50);

        if (!active || error || !data) return;
        const ordered = (data as Message[]).slice().reverse();

        updateMessagesWithCache((prev) => {
          const tempMessages = prev.filter((m) => String(m.id).startsWith("temp-"));
          const serverIds = new Set(ordered.map((m) => m.id));
          const remainingTemps = tempMessages.filter(
            (t) =>
              !ordered.some(
                (s) => s.sender_id === t.sender_id && s.content === t.content
              )
          );
          const merged = [...ordered, ...remainingTemps];

          const prevRealIds = prev
            .filter((m) => !String(m.id).startsWith("temp-"))
            .map((m) => `${m.id}:${m.content}`)
            .join("|");
          const nextRealIds = ordered.map((m) => `${m.id}:${m.content}`).join("|");

          if (prevRealIds === nextRealIds && remainingTemps.length === tempMessages.length && serverIds.size === ordered.length) {
            return prev;
          }
          if (isInitialLoadRef.current) {
            forceScrollToBottomInstant();
          } else {
            setTimeout(scrollToBottomSmooth, 80);
          }
          return merged;
        });
      } catch {
        // Ignore transient network poll error
      }
    };

    const channel = supabase
      .channel(`realtime:messages:${currentUser.id}:${selectedUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.receiver_id === currentUser.id) {
            updateMessagesWithCache((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            if (isInitialLoadRef.current) {
              forceScrollToBottomInstant();
            } else {
              setTimeout(scrollToBottomSmooth, 40);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === currentUser.id) {
            updateMessagesWithCache((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              const tempIdx = prev.findIndex(
                (m) =>
                  String(m.id).startsWith("temp-") &&
                  m.sender_id === newMsg.sender_id &&
                  m.content === newMsg.content
              );
              if (tempIdx !== -1) {
                const updated = [...prev];
                updated[tempIdx] = newMsg;
                return updated;
              }
              return [...prev, newMsg];
            });
            if (isInitialLoadRef.current) {
              forceScrollToBottomInstant();
            } else {
              setTimeout(scrollToBottomSmooth, 40);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          if (!updatedMsg?.id) return;
          updateMessagesWithCache((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const oldMsg = payload.old as { id?: string };
          if (!oldMsg?.id) return;
          updateMessagesWithCache((prev) => prev.filter((m) => m.id !== oldMsg.id));
        }
      )
      .subscribe();

    const pollTimer = setInterval(() => {
      void syncLatestMessages();
    }, 3000);

    return () => {
      active = false;
      clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [selectedUser.id, currentUser.id, supabase]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const handleConfirmDeleteMessage = async () => {
    if (!deletingMessage) return;
    const msgToDelete = deletingMessage;
    setIsDeletingMsg(true);
    try {
      // Optimistic removal
      updateMessagesWithCache((prev) => prev.filter((m) => m.id !== msgToDelete.id));
      setDeletingMessage(null);

      const res = await deleteMessageAction(msgToDelete.id);
      if (!res.success) {
        toast.error(res.error || "Mesaj silinemedi.");
      } else {
        toast.success("Mesaj kalıcı olarak silindi.");
        onMessageDeleted?.(msgToDelete.id);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("chat_message_deleted", {
              detail: {
                messageId: msgToDelete.id,
                otherUserId: selectedUser.id,
              },
            })
          );
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Mesaj silinemedi.");
    } finally {
      setIsDeletingMsg(false);
    }
  };

  const handleConfirmDeleteChat = async () => {
    setIsDeletingChat(true);
    try {
      const res = await deleteConversationAction(selectedUser.id);
      if (!res.success) {
        toast.error(res.error || "Sohbet silinemedi.");
        return;
      }

      messagesMemoryCache.delete(`${currentUser.id}:${selectedUser.id}`);
      messagesMemoryCache.delete(`${selectedUser.id}:${currentUser.id}`);
      setMessages([]);
      setShowDeleteChatModal(false);
      toast.success("Sohbet kalıcı olarak silindi.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("conversation_deleted", {
            detail: { otherUserId: selectedUser.id },
          })
        );
      }

      if (onConversationDeleted) {
        onConversationDeleted(selectedUser.id);
      } else if (onBack) {
        onBack();
      }
    } catch (err: any) {
      toast.error(err?.message || "Sohbet silinemedi.");
    } finally {
      setIsDeletingChat(false);
    }
  };

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 140);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 140 ? "auto" : "hidden";
  };

  const attachFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Dosya boyutu 50 MB'ı geçemez.");
      return;
    }
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    if (file.type.startsWith("image/")) {
      setPendingPreviewUrl(URL.createObjectURL(file));
    } else {
      setPendingPreviewUrl(null);
    }
  };

  const clearAttachment = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    attachFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault();
          const ext = blob.type.split("/")[1] || "png";
          const namedFile = new File([blob], `ekran-goruntusu-${Date.now()}.${ext}`, {
            type: blob.type,
          });
          attachFile(namedFile);
          toast.success("Ekran görüntüsü eklendi.");
          break;
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    adjustTextareaHeight();

    const lastWord = val.split(" ").pop();
    if (lastWord?.startsWith("@")) {
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  const selectMention = (project: { id: string; title: string }) => {
    const words = newMessage.split(" ");
    words.pop();
    const textWithoutQuery = words.join(" ");

    setNewMessage(
      textWithoutQuery + (textWithoutQuery ? " " : "") + `@${project.title} `
    );
    setMentionedProject(project);
    setShowMentionMenu(false);
    setTimeout(() => {
      adjustTextareaHeight();
      textareaRef.current?.focus();
    }, 10);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed && !pendingFile) return;

    const fileToUpload = pendingFile;
    const localPreview = pendingPreviewUrl;
    const savedMention = mentionedProject;
    const metadataProjectId = savedMention ? savedMention.id : undefined;

    // CASE 1: Text-only message — instant WhatsApp/Instagram feel (zero spinner, zero input lock)
    if (!fileToUpload) {
      const finalContent = encodeContentWithAttachment(trimmed, null);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const optimisticMsg: Message = {
        id: tempId,
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content: finalContent,
        created_at: new Date().toISOString(),
        is_read: false,
        metadata: metadataProjectId ? { mentioned_project_id: metadataProjectId } : null,
      };

      updateMessagesWithCache((prev) => [...prev, optimisticMsg]);
      setNewMessage("");
      setMentionedProject(null);
      setShowMentionMenu(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowY = "hidden";
      }
      setTimeout(scrollToBottomSmooth, 20);
      focusMessageTextarea();

      onMessageSent?.(optimisticMsg);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("chat_message_sent", {
            detail: { message: optimisticMsg, otherUserId: selectedUser.id },
          })
        );
      }

      try {
        const result = await sendMessageAction(
          selectedUser.id,
          finalContent,
          metadataProjectId,
          null
        );

        if (result.success) {
          updateMessagesWithCache((prev) => {
            const alreadyHasReal = prev.some((m) => m.id === result.message.id);
            if (alreadyHasReal) {
              return prev.filter((m) => m.id !== tempId);
            }
            return prev.map((m) => (m.id === tempId ? result.message : m));
          });
        } else {
          updateMessagesWithCache((prev) => prev.filter((m) => m.id !== tempId));
          toast.error("Mesaj gönderilemedi");
        }
      } catch (error: any) {
        updateMessagesWithCache((prev) => prev.filter((m) => m.id !== tempId));
        toast.error(error?.message || "Mesaj gönderilemedi");
      }
      return;
    }

    // CASE 2: Attachment / screenshot upload — show upload indicator and reset in finally
    if (isSending) return;
    shouldRestoreFocusRef.current = true;
    setIsSending(true);
    focusMessageTextarea();

    try {
      const uploadedAttachment = await uploadChatAttachment(
        fileToUpload,
        `dm-${currentUser.id}`
      );

      const finalContent = encodeContentWithAttachment(trimmed, uploadedAttachment);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const optimisticMsg: Message = {
        id: tempId,
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content: finalContent,
        created_at: new Date().toISOString(),
        is_read: false,
        metadata: {
          ...(metadataProjectId ? { mentioned_project_id: metadataProjectId } : {}),
          ...(uploadedAttachment ? { attachment: uploadedAttachment } : {}),
        },
      };

      updateMessagesWithCache((prev) => [...prev, optimisticMsg]);
      setNewMessage("");
      setMentionedProject(null);
      setPendingFile(null);
      setPendingPreviewUrl(null);
      if (localPreview) URL.revokeObjectURL(localPreview);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowY = "hidden";
      }
      setTimeout(scrollToBottomSmooth, 20);

      onMessageSent?.(optimisticMsg);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("chat_message_sent", {
            detail: { message: optimisticMsg, otherUserId: selectedUser.id },
          })
        );
      }

      const result = await sendMessageAction(
        selectedUser.id,
        finalContent,
        metadataProjectId,
        uploadedAttachment
      );

      if (result.success) {
        updateMessagesWithCache((prev) => {
          const alreadyHasReal = prev.some((m) => m.id === result.message.id);
          if (alreadyHasReal) {
            return prev.filter((m) => m.id !== tempId);
          }
          return prev.map((m) => (m.id === tempId ? result.message : m));
        });
        setTimeout(scrollToBottomSmooth, 40);
      } else {
        updateMessagesWithCache((prev) => prev.filter((m) => m.id !== tempId));
        setNewMessage(trimmed);
        setMentionedProject(savedMention);
        toast.error("Mesaj gönderilemedi");
      }
    } catch (error: any) {
      toast.error(error?.message || "Mesaj gönderilemedi");
      console.error(error);
    } finally {
      setIsSending(false);
      focusMessageTextarea();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/70 overflow-hidden relative border-l border-slate-200/80">
      {/* Header */}
      <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-10 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden inline-flex items-center gap-1 min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              aria-label="Konuşma listesine dön"
            >
              <ArrowLeft className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Geri</span>
            </button>
          )}
          {selectedUser.avatar_url ? (
            <img
              src={selectedUser.avatar_url}
              alt={selectedUser.full_name}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-violet-700 dark:text-violet-300 font-bold text-sm shadow-sm">
              {(selectedUser.full_name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
              {selectedUser.full_name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {selectedUser.institution ||
                selectedUser.university ||
                (selectedUser.role === "teacher" ? "Öğretmen" : "Öğrenci")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDeleteChatModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[36px] py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 transition-colors cursor-pointer"
            title="Sohbeti Kalıcı Olarak Sil"
          >
            <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
            <span className="hidden xs:inline sm:inline">Sohbeti Sil</span>
          </button>
          <a
            href={`/user/${selectedUser.id}`}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 min-h-[36px] py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
          >
            <span className="hidden xs:inline sm:inline">Profili Gör</span>
            <span className="sm:hidden">Profil</span> →
          </a>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-slate-50 dark:bg-zinc-950"
      >
        {isLoading ? (
          <div className="flex flex-col justify-end h-full space-y-3 py-2">
            <div className="flex justify-start">
              <div className="w-48 h-11 rounded-2xl rounded-tl-md bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            </div>
            <div className="flex justify-end">
              <div className="w-56 h-11 rounded-2xl rounded-tr-md bg-violet-500/20 dark:bg-violet-500/20 animate-pulse" />
            </div>
            <div className="flex justify-start">
              <div className="w-40 h-10 rounded-2xl rounded-tl-md bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center shadow-inner">
              <Send className="w-8 h-8 text-slate-400" />
            </div>
            <p className="max-w-xs text-sm font-medium !text-slate-900 dark:text-slate-100">
              Henüz mesaj yok. Sohbeti başlatmak için bir merhaba deyin!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === currentUser.id;
            const isLastFromSame =
              index > 0 && messages[index - 1].sender_id === msg.sender_id;
            const { text, attachment } = parseContentWithAttachment(
              msg.content,
              msg.metadata
            );

            return (
              <div
                key={msg.id}
                className={`group flex items-end gap-1.5 ${isMine ? "justify-end" : "justify-start"} ${
                  isLastFromSame ? "mt-1" : "mt-5"
                }`}
              >
                {/* Gönderen kullanıcı için mesaj silme butonu */}
                {isMine && !String(msg.id).startsWith("temp-") && (
                  <button
                    type="button"
                    onClick={() => setDeletingMessage(msg)}
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shrink-0 mb-1"
                    title="Mesajı kalıcı olarak sil"
                    aria-label="Mesajı kalıcı olarak sil"
                  >
                    <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                  </button>
                )}
                {!isMine && (
                  <div className="shrink-0 mr-2.5 mt-0.5">
                    {selectedUser.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-xs shadow-sm">
                        {(selectedUser.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[78%] md:max-w-[72%] px-4 sm:px-5 py-3 shadow-sm overflow-hidden ${
                    isMine
                      ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl rounded-tr-md shadow-[0_4px_10px_-2px_rgba(167,139,250,0.3)] border border-violet-400/30"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-md border border-slate-200 dark:border-slate-800 shadow-sm"
                  }`}
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                >
                  {!isMine && !isLastFromSame && (
                    <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 mb-1">
                      {selectedUser.full_name}
                    </p>
                  )}

                  {attachment && (
                    <div className={text ? "mb-2.5" : ""}>
                      {isImageAttachment(attachment) ? (
                        <ChatImageAttachment
                          url={attachment.url}
                          name={attachment.name}
                          onClick={() =>
                            setLightboxImage({
                              url: attachment.url,
                              name: attachment.name,
                            })
                          }
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            downloadAttachment(attachment.url, attachment.name);
                          }}
                          className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            isMine
                              ? "bg-white/15 hover:bg-white/25 text-white border-white/25"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700"
                          }`}
                          title="Dosyayı indir"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/15 dark:bg-slate-700 flex items-center justify-center shrink-0 pointer-events-none">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1 pointer-events-none">
                            <p className="text-xs font-semibold truncate">
                              {attachment.name}
                            </p>
                            {attachment.size ? (
                              <p className="text-[10px] opacity-75">
                                {formatAttachmentSize(attachment.size)}
                              </p>
                            ) : null}
                          </div>
                          <Download className="w-4 h-4 shrink-0 opacity-80 pointer-events-none" />
                        </button>
                      )}
                    </div>
                  )}

                  {text && (
                    <p
                      className="whitespace-pre-wrap break-words leading-relaxed text-sm"
                      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    >
                      {renderMessageWithLinks(text)}
                    </p>
                  )}

                  {msg.metadata?.mentioned_project_id && (
                    <a
                      href={`/dashboard/projects/${msg.metadata.mentioned_project_id}`}
                      className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                        isMine
                          ? "bg-white/20 hover:bg-white/30 text-white border-white/20"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 border-slate-200/60"
                      }`}
                    >
                      <FolderRoot className="w-3.5 h-3.5" /> Projeyi Gör
                    </a>
                  )}

                  <div
                    className={`text-[10px] mt-2 font-medium ${
                      isMine
                        ? "text-indigo-200"
                        : "text-slate-500 dark:text-slate-400"
                    } text-right tracking-wide`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Alıcı kullanıcı için de mesaj silme butonu */}
                {!isMine && !String(msg.id).startsWith("temp-") && (
                  <button
                    type="button"
                    onClick={() => setDeletingMessage(msg)}
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shrink-0 mb-1 order-last"
                    title="Mesajı kalıcı olarak sil"
                    aria-label="Mesajı kalıcı olarak sil"
                  >
                    <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Attachment Preview Bar */}
      {pendingFile && (
        <div className="px-4 py-2.5 bg-violet-50/80 dark:bg-zinc-800/90 border-t border-violet-100 dark:border-zinc-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {pendingPreviewUrl ? (
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-violet-200 dark:border-zinc-600 shrink-0">
                <img
                  src={pendingPreviewUrl}
                  alt={pendingFile.name}
                  className="w-full h-full object-cover"
                />
                {isSending && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                {isSending ? (
                  <Loader2 className="w-4 h-4 text-violet-600 dark:text-violet-300 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {pendingFile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isSending ? "Yükleniyor..." : formatAttachmentSize(pendingFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSending}
            onClick={clearAttachment}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-700 transition-colors shrink-0 disabled:opacity-40"
            title="Eki kaldır"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-20 shrink-0">
        {showMentionMenu && projects.length > 0 && (
          <div className="absolute bottom-[calc(100%+8px)] left-5 mb-2 w-72 bg-white dark:bg-slate-900 md:bg-white/95 md:backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30">
            <div className="px-4 py-3 text-xs font-bold text-sage-green border-b border-slate-100 bg-slate-50/50 uppercase tracking-widest">
              Bir projeden bahset
            </div>
            <ul className="max-h-48 overflow-y-auto custom-scrollbar p-1">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="px-4 py-3 hover:bg-sage-green/5 rounded-xl cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:pl-5 border border-transparent hover:border-sage-green/10 m-1 flex items-center"
                  onClick={() => selectMention(p)}
                >
                  <FolderRoot className="w-4 h-4 mr-2 text-sage-green shrink-0" />
                  <span className="truncate">{p.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2 sm:gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_CHAT_FILES}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isSending}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-violet-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-violet-300 border border-slate-200/80 dark:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
            title="Dosya veya görsel ekle"
          >
            <Paperclip className="w-4 h-4 pointer-events-none" />
          </button>

          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
            readOnly={isSending}
            placeholder="Bir şeyler yazın..."
            className="flex-1 min-h-[44px] max-h-[140px] resize-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 leading-relaxed overflow-hidden read-only:opacity-70"
          />

          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            disabled={(!newMessage.trim() && !pendingFile) || isSending}
            className={`px-4 sm:px-5 h-11 rounded-2xl transition-all font-semibold flex items-center justify-center shrink-0 active:scale-95 ${
              (newMessage.trim() || pendingFile) && !isSending
                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm dark:bg-violet-600 dark:hover:bg-violet-500 dark:text-white cursor-pointer"
                : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin pointer-events-none" />
            ) : (
              <Send className="w-5 h-5 pointer-events-none" />
            )}
          </button>
        </form>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full mb-2 px-1 text-white">
              <span className="text-xs font-medium truncate max-w-md">
                {lightboxImage.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadAttachment(lightboxImage.url, lightboxImage.name)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="İndir"
                >
                  <Download className="w-4 h-4 pointer-events-none" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Mesaj Silme Onay Modalı */}
      {deletingMessage && (
        <div
          className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeletingMsg && setDeletingMessage(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Mesajı Kalıcı Olarak Sil</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bu işlem geri alınamaz.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bu mesajı her iki taraf için de kalıcı olarak silmek istediğinizden emin misiniz?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingMsg}
                onClick={() => setDeletingMessage(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isDeletingMsg}
                onClick={handleConfirmDeleteMessage}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeletingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sohbeti Kalıcı Olarak Silme Modalı */}
      {showDeleteChatModal && (
        <div
          className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeletingChat && setShowDeleteChatModal(false)}
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
              <strong className="text-slate-900 dark:text-slate-100">{selectedUser.full_name}</strong> ile olan tüm mesajlaşma geçmişiniz kalıcı olarak silinecektir. Bu işlem geri alınamaz ve bu kişi sohbet listenizden tamamen kaldırılacaktır.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingChat}
                onClick={() => setShowDeleteChatModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isDeletingChat}
                onClick={handleConfirmDeleteChat}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeletingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Sohbeti Kalıcı Olarak Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
