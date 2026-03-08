'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage, markMessagesAsRead } from './actions';
import { Send, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ChatWindowProps = {
  currentUserId: string;
  selectedUserId: string;
  selectedUserName: string;
  initialMessages: Message[];
};

export default function ChatWindow({
  currentUserId,
  selectedUserId,
  selectedUserName,
  initialMessages
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when user opens the chat
  useEffect(() => {
    if (selectedUserId) {
       markMessagesAsRead(selectedUserId);
    }
  }, [selectedUserId]);

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get('content') as string;
    if (!content.trim()) return;

    setIsPending(true);
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    const newMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      content: content.trim(),
      created_at: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, newMessage]);

    // Format Data
    formData.append('receiver_id', selectedUserId);
    formData.append('current_path', `/dashboard/messages?userId=${selectedUserId}`);

    const result = await sendMessage(formData);
    
    if (result.error) {
       toast.error(result.error);
       setMessages((prev) => prev.filter(m => m.id !== tempId)); // revert on error
    }

    // Reset form
    const form = document.getElementById('chat-form') as HTMLFormElement;
    if (form) form.reset();

    setIsPending(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/40 relative">
      {/* Chat Başlığı */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-10 shrink-0">
        <Link href="/dashboard/messages" className="md:hidden p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-200">{selectedUserName}</span>
        </div>
      </div>

      {/* Mesaj Listesi (Scrollable) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
           <div className="h-full flex items-center justify-center text-slate-500 text-sm">
             Henüz mesajlaşmadınız. Bir sohbete başlamak için aşağıdan yazın.
           </div>
        ) : (
          messages.map((msg) => {
             const isMe = msg.sender_id === currentUserId;
             return (
               <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'
                    }`}
                  >
                     <p className="whitespace-pre-wrap break-words text-[15px]">{msg.content}</p>
                     <span className={`block text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                       {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
               </div>
             )
          })
        )}
      </div>

      {/* Mesaj Gönderme Çubuğu */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-sm shrink-0">
         <form id="chat-form" action={handleSubmit} className="flex gap-2 items-end relative">
            <textarea
              name="content"
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors resize-none placeholder-slate-500 min-h-[50px] max-h-[120px]"
              rows={1}
              required
              onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isPending) {
                       const form = e.currentTarget.form;
                       if (form) form.requestSubmit();
                    }
                 }
              }}
            />
            <button
               type="submit"
               disabled={isPending}
                 className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 mb-0.5"
            >
               {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                  <Send className="w-5 h-5 ml-0.5" />
               )}
            </button>
         </form>
      </div>

    </div>
  );
}
