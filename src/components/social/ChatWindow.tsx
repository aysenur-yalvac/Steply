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
    <div className="flex flex-col h-full w-full bg-slate-900/50 backdrop-blur-2xl rounded-r-3xl overflow-hidden relative border-l border-slate-700/50">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50 bg-slate-900/60 shrink-0 z-10 shadow-sm">
        <h3 className="text-xl font-bold tracking-tight text-white">{selectedUser.full_name}</h3>
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
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isLastFromSame ? 'mt-1' : 'mt-6'}`}>
                <div 
                  className={`max-w-[75%] md:max-w-[70%] px-5 py-3 shadow-md ${
                    isMine 
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-tr-md shadow-indigo-500/20' 
                      : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-md border border-slate-700/50 shadow-slate-900/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  
                  {msg.metadata?.mentioned_project_id && (
                    <a 
                      href={`/dashboard/projects/${msg.metadata.mentioned_project_id}`}
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg text-xs font-semibold transition-all shadow-inner border border-white/5"
                    >
                      <FolderRoot className="w-3.5 h-3.5" /> View Project
                    </a>
                  )}
                  
                  <div className={`text-[10px] mt-2 font-medium ${isMine ? 'text-indigo-200' : 'text-slate-500'} text-right tracking-wide`}>
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
      <div className="p-4 sm:p-5 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-xl relative z-20 shrink-0">
        {showMentionMenu && projects.length > 0 && (
          <div className="absolute bottom-[calc(100%+8px)] left-5 mb-2 w-72 bg-slate-800/95 backdrop-blur-3xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-30">
            <div className="px-4 py-3 text-xs font-bold text-indigo-400 border-b border-slate-700/50 bg-slate-900/50 uppercase tracking-widest">
              Mention a project
            </div>
            <ul className="max-h-48 overflow-y-auto custom-scrollbar p-1">
              {projects.map(p => (
                <li 
                  key={p.id} 
                  className="px-4 py-3 hover:bg-indigo-500/10 rounded-xl cursor-pointer text-sm font-medium text-slate-200 transition-all hover:pl-5 border border-transparent hover:border-indigo-500/20 m-1 flex items-center"
                  onClick={() => selectMention(p)}
                >
                  <FolderRoot className="w-4 h-4 mr-2 text-indigo-400 shrink-0" />
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
            className="flex-1 bg-slate-950/50 focus:bg-slate-900 border border-slate-700/60 rounded-2xl px-5 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-500 shadow-inner"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-2xl transition-all shadow-glow hover:shadow-[0_0_20px_-3px_var(--color-indigo-500)] active:scale-95 flex items-center justify-center shrink-0 border border-indigo-400/20"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white" />}
          </button>
        </form>
      </div>
    </div>
  );
}
