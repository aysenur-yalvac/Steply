"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { addProjectNoteAction } from "@/lib/actions";
import type { ProjectNote } from "@/lib/actions";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/avatar";

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
    <div className="border-2 border-blue-500/30 rounded-2xl shadow-xl overflow-hidden flex flex-col">

      {/* ── Header — slate-100 ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-100 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/15">
          <MessageSquare className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-none">Proje Notları</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sadece ekip üyeleri görebilir</p>
        </div>
      </div>

      {/* ── Message area — white ────────────────────────────────────────────── */}
      <div
        ref={listRef}
        className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-4 flex flex-col gap-3
                   bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2">
            <MessageSquare className="w-8 h-8 text-slate-200" />
            <p className="text-sm text-slate-400 text-center">Henüz not yok. İlk notu sen ekle!</p>
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
                {/* Avatar */}
                <div className="shrink-0 self-end mb-0.5">
                  <Avatar src={note.author_avatar} name={note.author_name ?? "?"} size="sm" />
                </div>

                {/* Bubble wrapper — max 75% width, never overflows */}
                <div className={`flex flex-col min-w-0 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && (
                    <span className="text-[11px] font-semibold text-slate-500 mb-0.5 ml-1 truncate max-w-full">
                      {note.author_name ?? "Üye"}
                    </span>
                  )}

                  <div
                    className={`
                      w-full overflow-hidden px-4 py-2.5 text-sm leading-relaxed
                      break-words whitespace-pre-wrap
                      ${isOwn
                        ? "bg-blue-600 text-white rounded-2xl rounded-br-none shadow-md"
                        : "bg-slate-100 text-gray-800 rounded-2xl rounded-bl-none shadow-sm border border-slate-200"
                      }
                    `}
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {note.content}
                    <span
                      className={`block text-right text-[10px] mt-1 select-none ${
                        isOwn ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(note.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Input bar — slate-100 (mirrors header) ─────────────────────────── */}
      <div className="bg-slate-100 border-t border-gray-200 px-3 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir mesaj yaz… (Enter ile gönder)"
            rows={1}
            maxLength={1000}
            disabled={isSubmitting}
            className="
              flex-1 resize-none px-4 py-2.5 rounded-xl
              bg-white border border-gray-200 shadow-sm
              text-sm text-gray-800 placeholder-gray-400
              outline-none transition-all leading-snug
              focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
              disabled:opacity-50
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="
              flex items-center justify-center w-10 h-10 rounded-xl shrink-0
              bg-blue-600 hover:bg-blue-700 text-white
              shadow-sm hover:shadow-blue-500/30 active:scale-90
              transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
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
