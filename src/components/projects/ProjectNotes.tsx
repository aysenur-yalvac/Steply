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

function timeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
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

  // Auto-scroll to bottom when notes change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [notes]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    // Optimistic note
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
        // Replace temp with real note
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
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Proje Notları
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Sadece proje ekibi görebilir · Enter ile gönder
        </p>
      </div>

      {/* Notes list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto min-h-[160px] max-h-[360px] px-6 py-4 flex flex-col gap-4
                   [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]"
      >
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center my-auto py-6">
            Henüz not yok. İlk notu sen ekle!
          </p>
        ) : (
          notes.map((note) => {
            const isOwn = note.user_id === currentUserId;
            return (
              <div
                key={note.id}
                className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="shrink-0 mt-0.5">
                  <Avatar
                    src={note.author_avatar}
                    name={note.author_name ?? "?"}
                    size="sm"
                  />
                </div>

                <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm
                      ${isOwn
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-sm"
                      }
                      ${note.id.startsWith("temp-") ? "opacity-60" : ""}`}
                  >
                    {note.content}
                  </div>
                  <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-[11px] font-medium text-slate-500">
                      {note.author_name ?? "Üye"}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[11px] text-slate-400">{timeLabel(note.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 flex items-end gap-2 px-4 pb-4 pt-3 border-t border-slate-100"
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Bir not yaz… (Enter ile gönder, Shift+Enter yeni satır)"
          rows={2}
          maxLength={1000}
          disabled={isSubmitting}
          className="flex-1 resize-none px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200
                     text-sm text-slate-800 placeholder-slate-400 outline-none transition-all
                     focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400
                     disabled:opacity-50 [scrollbar-width:thin]"
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700
                     text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isSubmitting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </form>
    </div>
  );
}
