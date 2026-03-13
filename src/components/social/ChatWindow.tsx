"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, FolderRoot } from 'lucide-react';
import { getMessagesAction, sendMessageAction, getUserProjectsAction, Message } from '@/lib/social-actions';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="flex flex-col h-full w-full bg-black/20 backdrop-blur-3xl rounded-r-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/[0.02] shrink-0 z-10">
        <h3 className="text-2xl font-black tracking-tighter text-white drop-shadow-md">{selectedUser.full_name}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-3">
             <div className="w-16 h-16 rounded-full bg-slate-800/50 flex flex-col items-center justify-center shadow-inner">
               <Send className="w-8 h-8 text-slate-600" />
             </div>
             <p className="max-w-xs">No messages yet. Say hi to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === currentUser.id;
            // Group messages if they are from the same person (simple check)
            const isLastFromSame = index > 0 && messages[index - 1].sender_id === msg.sender_id;
            
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isLastFromSame ? 'mt-1.5' : 'mt-8'}`}>
                <div 
                  className={`max-w-[80%] md:max-w-[70%] px-6 py-4 shadow-xl ${
                    isMine 
                      ? 'bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white rounded-3xl rounded-tr-sm shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] border border-indigo-400/20' 
                      : 'bg-white/[0.03] text-slate-200 rounded-3xl rounded-tl-sm border border-white/10 backdrop-blur-lg'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-light leading-relaxed tracking-wide">{msg.content}</p>
                  
                  {msg.metadata?.mentioned_project_id && (
                    <a 
                      href={`/dashboard/projects/${msg.metadata.mentioned_project_id}`}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-black/40 hover:bg-black/60 rounded-xl text-xs font-bold transition-all shadow-inner border border-white/10"
                    >
                      <FolderRoot className="w-4 h-4 text-indigo-300" strokeWidth={1.5} /> View Architecture
                    </a>
                  )}
                  
                  <div className={`text-[10px] mt-2 font-bold ${isMine ? 'text-indigo-200/80' : 'text-slate-500'} text-right tracking-[0.1em] uppercase`}>
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
      <div className="p-5 sm:p-6 border-t border-white/10 bg-white/[0.01] backdrop-blur-2xl relative z-20 shrink-0">
        {showMentionMenu && projects.length > 0 && (
          <div className="absolute bottom-[calc(100%+12px)] left-6 mb-2 w-80 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-float overflow-hidden z-30">
            <div className="px-5 py-4 text-xs font-black text-indigo-400 border-b border-white/5 bg-black/40 uppercase tracking-[0.2em]">
              Mention Architecture
            </div>
            <ul className="max-h-56 overflow-y-auto custom-scrollbar p-1.5">
              {projects.map(p => (
                <li 
                  key={p.id} 
                  className="px-5 py-3 hover:bg-indigo-500/15 rounded-2xl cursor-pointer text-sm font-medium text-slate-200 transition-all hover:pl-6 border border-transparent hover:border-indigo-500/30 m-1 flex items-center"
                  onClick={() => selectMention(p)}
                >
                  <FolderRoot className="w-4 h-4 mr-3 text-indigo-400 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{p.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message... (Use @ to tag a project)"
            className="flex-1 bg-black/40 focus:bg-black/60 border border-white/10 rounded-full px-6 py-4 text-sm text-white font-light focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600 shadow-inner"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-600 text-white font-bold rounded-full transition-all shadow-glow active:scale-95 flex items-center justify-center shrink-0 border border-indigo-400/30 overflow-hidden relative group"
          >
             {/* Glow Sweep */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] ${(!newMessage.trim() || isSending) ? '' : 'group-hover:animate-[shimmer_1.5s_infinite]'}`} />
            {isSending ? <Loader2 className="w-6 h-6 animate-spin relative z-10" strokeWidth={2} /> : <Send className="w-6 h-6 ml-1 relative z-10" strokeWidth={2} />}
          </button>
        </form>
      </div>
    </div>
  );
}
