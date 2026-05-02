"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { addProjectNoteAction } from "@/lib/actions";
import type { ProjectNote } from "@/lib/actions";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/avatar";

const CHAR_LIMIT = 250;
const ASCII_TABLE_RE = /[┌┐└┘│─├┤┼╔╗╚╝║═╠╣╬╟╢╞╡]/u;

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

// ── MessageBubble — owns its own expanded/collapsed state ─────────────────────
function MessageBubble({ note, isOwn }: { note: ProjectNote; isOwn: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasTable = ASCII_TABLE_RE.test(note.content);
  const isTruncated = !hasTable && note.content.length > CHAR_LIMIT;
  const displayText =
    isTruncated && !expanded ? note.content.slice(0, CHAR_LIMIT).trimEnd() + "…" : note.content;

  return (
    <div
      className={`
        w-full overflow-hidden px-4 py-3 text-sm leading-relaxed
        break-words whitespace-pre-wrap
        ${isOwn
          ? "bg-[#7C3AFF] text-white rounded-2xl rounded-br-none shadow-md"
          : "bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm border border-gray-100"
        }
      `}
      style={{ overflowWrap: "anywhere" }}
    >
      {displayText}

      {isTruncated && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`block mt-1.5 text-xs font-semibold transition-colors ${
            isOwn ? "text-gray-300 hover:text-white" : "text-indigo-500 hover:text-indigo-700"
          }`}
        >
          {expanded ? "Daha az göster" : "Devamını oku"}
        </button>
      )}

      <span
        className={`block text-right text-[10px] mt-1.5 select-none ${
          isOwn ? "text-gray-400" : "text-gray-300"
        }`}
      >
        {formatTime(note.created_at)}
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
          <MessageSquare className="w-4 h-4 text-gray-500" />
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

                <div className={`flex flex-col min-w-0 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
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
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-100 px-3 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir mesaj yaz…"
            rows={1}
            maxLength={1000}
            disabled={isSubmitting}
            className="
              flex-1 resize-none px-4 py-2.5 rounded-xl
              bg-gray-50 border border-gray-200
              text-sm text-gray-800 placeholder-gray-400
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
