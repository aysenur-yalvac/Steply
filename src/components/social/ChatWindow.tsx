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
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur shrink-0">
        <h3 className="text-lg font-bold text-white">{selectedUser.full_name}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.metadata?.mentioned_project_id && (
                    <a 
                      href={`/dashboard/projects/${msg.metadata.mentioned_project_id}`}
                      className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-black/20 hover:bg-black/30 rounded text-xs font-medium transition-colors"
                    >
                      <FolderRoot className="w-3 h-3" /> Project
                    </a>
                  )}
                  
                  <div className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-500'} text-right`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 relative">
        {showMentionMenu && projects.length > 0 && (
          <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700 bg-slate-900/50">
              Mention a project
            </div>
            <ul className="max-h-40 overflow-y-auto">
              {projects.map(p => (
                <li 
                  key={p.id} 
                  className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-200 transition-colors"
                  onClick={() => selectMention(p)}
                >
                  {p.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message... (Use @ to mention a project)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:text-slate-400 text-white rounded-xl transition-all flex items-center justify-center"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
