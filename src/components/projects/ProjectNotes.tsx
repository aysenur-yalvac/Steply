"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { addProjectNoteAction } from "@/lib/actions";
import type { ProjectNote } from "@/lib/actions";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/avatar";

const LONG_MSG_CHARS = 300;

interface Props {
  projectId: string;
  initialNotes: ProjectNote[];
  currentUserId: string;
  currentUserName: string | null;
  currentUserAvatar: string | null;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── MessageBubble — universal CSS collapse, no horizontal scroll ──────────────
function MessageBubble({ note, isOwn }: { note: ProjectNote; isOwn: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note.content.length > LONG_MSG_CHARS;

  // 1. Bubble Container styling
  const bubbleBase = isOwn
    ? "bg-violet-50 border border-violet-100 rounded-2xl rounded-tr-none shadow-sm dark:bg-purple-600/90 dark:text-white dark:border-purple-500/50"
    : "bg-gray-100 border border-gray-200/60 rounded-2xl rounded-tl-none shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-700/70";

  const toggleColor = isOwn
    ? "text-violet-600 hover:text-violet-800"
    : "text-gray-600 dark:text-slate-300 hover:text-gray-800";

  const fromColor = isOwn ? "from-violet-50" : "from-gray-100";

  // Create timestamp
  const timestamp = note.created_at 
    ? new Date(note.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : "";

  return (
    <div className={`max-w-[85%] w-fit px-4 py-3 ${bubbleBase}`}>
      <div className="relative">
        <div
          className={`text-sm text-gray-800 dark:text-inherit leading-relaxed whitespace-pre-wrap break-words overflow-hidden ${
            isLong && !expanded ? "max-h-[150px]" : "max-h-none"
          }`}
        >
          {note.content}
        </div>

        {/* Fade-out gradient when collapsed */}
        {isLong && !expanded && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t ${fromColor} to-transparent`}
          />
        )}
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`mt-1.5 text-xs font-semibold transition-colors ${toggleColor}`}
        >
          {expanded ? "Daha az göster" : "Devamını oku"}
        </button>
      )}

      {/* 3. Footer Timestamp */}
      <span className="text-[11px] text-gray-400 dark:text-slate-400 mt-2 text-right block select-none">
        {timestamp}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProjectNotes({
  projectId,
  initialNotes,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: Props) {
  const [notes, setNotes] = useState<ProjectNote[]>(initialNotes);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [notes]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: ProjectNote = {
      id: tempId,
      project_id: projectId,
      user_id: currentUserId,
      content: trimmed,
      created_at: new Date().toISOString(),
      author_name: currentUserName,
      author_avatar: currentUserAvatar,
    };

    setNotes((prev) => [...prev, optimistic]);
    setContent("");
    setIsSubmitting(true);

    try {
      const result = await addProjectNoteAction(projectId, trimmed);
      if ("error" in result) {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        setContent(trimmed);
        toast.error(result.error);
      } else {
        setNotes((prev) => prev.map((n) => (n.id === tempId ? result.note : n)));
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border border-gray-200/70 rounded-2xl shadow-sm overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-white/90 backdrop-blur-sm border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100">
          <MessageSquare className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 leading-none">Proje Notları</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Sadece ekip üyeleri görebilir</p>
        </div>
      </div>

      {/* Message area */}
      <div
        ref={listRef}
        className="flex-1 min-h-[200px] max-h-[420px] overflow-y-auto px-4 py-4 flex flex-col gap-3.5
                   bg-[#F9FAFB] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2">
            <MessageSquare className="w-7 h-7 text-gray-200" />
            <p className="text-sm text-gray-400">Henüz not yok. İlk notu sen ekle!</p>
          </div>
        ) : (
          notes.map((note) => {
            const isOwn = note.user_id === currentUserId;
            return (
              <div
                key={note.id}
                className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200
                  ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="shrink-0 self-end mb-0.5">
                  <Avatar src={note.author_avatar} name={note.author_name ?? "?"} size="sm" />
                </div>

                <div className={`flex flex-col min-w-0 max-w-[90%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && (
                    <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">
                      {note.author_name ?? "Üye"}
                    </span>
                  )}
                  <MessageBubble note={note} isOwn={isOwn} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input bar */}
      <div className="bg-white/90 dark:bg-[#1a2234] backdrop-blur-sm border-t border-gray-100 dark:border-slate-700/60 px-3 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir mesaj yaz…"
            rows={1}
            maxLength={100000}
            disabled={isSubmitting}
            className="
              flex-1 resize-none px-4 py-2.5 rounded-xl
              bg-gray-50 border border-gray-200 text-sm text-gray-800 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 focus:dark:border-purple-500 placeholder-gray-400 dark:placeholder-slate-500
              outline-none transition-all leading-snug
              focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200
              disabled:opacity-50
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="
              flex items-center justify-center w-10 h-10 rounded-xl shrink-0
              bg-[#7C3AFF] hover:bg-[#6D28D9] text-white
              shadow-sm active:scale-90
              transition-all duration-150
              disabled:opacity-30 disabled:cursor-not-allowed
            "
          >
            {isSubmitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </form>
      </div>

    </div>
  );
}
