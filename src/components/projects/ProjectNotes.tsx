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
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3.5 border-b border-slate-100 shrink-0">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          Proje Notları
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Sadece proje ekibi görebilir · Enter ile gönder
        </p>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        className="flex-1 min-h-[180px] max-h-[380px] overflow-y-auto px-5 py-4 flex flex-col gap-3
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center my-auto py-8">
            Henüz not yok. İlk notu sen ekle!
          </p>
        ) : (
          notes.map((note) => {
            const isOwn = note.user_id === currentUserId;
            const isTemp = note.id.startsWith("temp-");

            return (
              <div
                key={note.id}
                className={`flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300
                  ${isOwn ? "flex-row-reverse" : "flex-row"}
                  ${isTemp ? "opacity-60" : "opacity-100"}`}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-auto mb-0.5">
                  <Avatar
                    src={note.author_avatar}
                    name={note.author_name ?? "?"}
                    size="sm"
                  />
                </div>

                {/* Bubble */}
                <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
                  <div
                    className={`
                      relative px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words
                      ${isOwn
                        ? "bg-purple-600 text-white rounded-2xl rounded-br-none shadow-md"
                        : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none shadow-sm"
                      }
                    `}
                  >
                    {note.content}
                    {/* Time — inside bubble, bottom-right */}
                    <span
                      className={`block text-right text-[10px] mt-1 opacity-70 ${
                        isOwn ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {formatTime(note.created_at)}
                    </span>
                  </div>

                  {/* Author name below bubble */}
                  <span className="text-[11px] font-medium text-slate-500 mt-1 px-0.5 truncate max-w-[120px]">
                    {note.author_name ?? "Üye"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input area */}
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
          className="
            flex-1 resize-none px-4 py-2.5 rounded-2xl
            bg-slate-50 border border-slate-200
            text-sm text-slate-800 placeholder-slate-400
            outline-none transition-all
            focus:ring-2 focus:ring-purple-500/25 focus:border-purple-400
            disabled:opacity-50
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="
            flex items-center justify-center w-10 h-10 rounded-2xl shrink-0
            bg-purple-600 hover:bg-purple-700 text-white
            shadow-md hover:shadow-purple-500/30
            active:scale-90 transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
          "
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
