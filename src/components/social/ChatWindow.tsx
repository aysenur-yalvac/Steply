"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, FolderRoot } from 'lucide-react';
import { getMessagesAction, sendMessageAction, getUserProjectsAction, markMessagesAsReadAction, Message } from '@/lib/social-actions';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  full_name: string;
}

interface ChatWindowProps {
  currentUser: User;
  selectedUser: User;
}

export default function ChatWindow({ currentUser, selectedUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mention State
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionedProject, setMentionedProject] = useState<{ id: string; title: string } | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await getMessagesAction(selectedUser.id);
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    };

    loadMessages();

    // Load user projects for mentions
    const loadProjects = async () => {
      try {
        const data = await getUserProjectsAction();
        setProjects(data || []);
      } catch (error) {
        console.error("Failed to load projects for mentions", error);
      }
    };
    loadProjects();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${selectedUser.id}`, 
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.receiver_id === currentUser.id) {
            setMessages((prev) => [...prev, newMsg]);
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${selectedUser.id}`, 
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === currentUser.id) {
            // Already added optimistically, or can let realtime add it
            // To avoid duplicates, check if it exists (but usually we optimistic update)
            setMessages((prev) => {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser.id, currentUser.id, supabase]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      const container = messagesEndRef.current.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    // Naive mention detect
    const lastWord = val.split(' ').pop();
    if (lastWord?.startsWith('@')) {
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  const selectMention = (project: { id: string; title: string }) => {
    const words = newMessage.split(' ');
    words.pop(); // remove the @ query
    const textWithoutQuery = words.join(' ');
    
    setNewMessage(textWithoutQuery + (textWithoutQuery ? ' ' : '') + `@${project.title} `);
    setMentionedProject(project);
    setShowMentionMenu(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    const metadataProjectId = mentionedProject ? mentionedProject.id : undefined;

    setIsSending(true);
    try {
      const result = await sendMessageAction(selectedUser.id, content, metadataProjectId);
      
      // Optimistic update
      if (result.success) {
        setMessages((prev) => [...prev, result.message]);
        setNewMessage("");
        setMentionedProject(null);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/70 overflow-hidden relative border-l border-slate-200/80">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-10 shadow-sm">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 dark:text-white">{selectedUser.full_name}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-slate-50 dark:bg-zinc-950">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 space-y-3">
             <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center shadow-inner">
               <Send className="w-8 h-8 text-slate-400" />
             </div>
             <p className="max-w-xs text-sm font-medium !text-slate-900 dark:text-slate-100">No messages yet. Say hi to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === currentUser.id;
            // Group messages if they are from the same person (simple check)
            const isLastFromSame = index > 0 && messages[index - 1].sender_id === msg.sender_id;
            
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isLastFromSame ? 'mt-1' : 'mt-6'}`}>
                <div 
                  className={`max-w-[75%] md:max-w-[70%] px-5 py-3 shadow-sm ${
                    isMine 
                      ? 'bg-gradient-to-br from-soft-lavender to-violet-400 text-white rounded-2xl rounded-tr-md shadow-[0_4px_10px_-2px_rgba(167,139,250,0.3)] border border-violet-200/50' 
                      : 'bg-white text-slate-700 rounded-2xl rounded-tl-md border border-slate-200 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                  
                  {msg.metadata?.mentioned_project_id && (
                    <a 
                      href={`/dashboard/projects/${msg.metadata.mentioned_project_id}`}
                      className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                        isMine 
                          ? 'bg-white/20 hover:bg-white/30 text-white border-white/20' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60'
                      }`}
                    >
                      <FolderRoot className="w-3.5 h-3.5" /> View Project
                    </a>
                  )}
                  
                  <div className={`text-[10px] mt-2 font-medium ${isMine ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'} text-right tracking-wide`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-20 shrink-0">
        {showMentionMenu && projects.length > 0 && (
          <div className="absolute bottom-[calc(100%+8px)] left-5 mb-2 w-72 bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30">
            <div className="px-4 py-3 text-xs font-bold text-sage-green border-b border-slate-100 bg-slate-50/50 uppercase tracking-widest">
              Mention a project
            </div>
            <ul className="max-h-48 overflow-y-auto custom-scrollbar p-1">
              {projects.map(p => (
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

        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message... (Use @ to tag a project)"
            className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3.5 text-sm text-slate-800 dark:text-slate-200 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-5 py-3.5 bg-dusty-rose hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center shrink-0"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white" />}
          </button>
        </form>
      </div>
    </div>
  );
}
