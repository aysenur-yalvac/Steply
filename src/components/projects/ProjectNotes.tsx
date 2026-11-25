"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  MessageSquare,
  Paperclip,
  FileText,
  Download,
  X,
} from "lucide-react";
import { addProjectNoteAction } from "@/lib/actions";
import type { ProjectNote } from "@/lib/actions";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/avatar";
import {
  ACCEPTED_CHAT_FILES,
  ChatAttachment,
  downloadAttachment,
  encodeContentWithAttachment,
  formatAttachmentSize,
  isImageAttachment,
  parseContentWithAttachment,
  uploadChatAttachment,
} from "@/lib/chat-attachments";
import { renderMessageWithLinks } from "@/lib/linkify";

const LONG_MSG_CHARS = 360;

interface Props {
  projectId: string;
  initialNotes: ProjectNote[];
  currentUserId: string;
  currentUserName: string | null;
  currentUserAvatar: string | null;
}

function ImageAttachmentPreview({
  url,
  name,
  onClick,
}: {
  url: string;
  name: string;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block rounded-xl overflow-hidden border border-black/10 dark:border-white/15 hover:opacity-95 transition-opacity max-w-full cursor-pointer"
      title="Görseli büyütmek için tıklayın"
    >
      {!loaded && (
        <div className="w-56 h-36 flex items-center justify-center bg-black/10 dark:bg-white/10 animate-pulse rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin opacity-70" />
        </div>
      )}
      <img
        src={url}
        alt={name}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`max-h-60 w-auto max-w-full object-contain rounded-xl bg-black/5 transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0 absolute inset-0"
        }`}
      />
    </button>
  );
}

function MessageBubble({
  note,
  isOwn,
  onImageClick,
}: {
  note: ProjectNote;
  isOwn: boolean;
  onImageClick: (url: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { text, attachment } = parseContentWithAttachment(note.content);
  const isLong = text.length > LONG_MSG_CHARS;

  const bubbleBase = isOwn
    ? "bg-violet-50 border border-violet-100 rounded-2xl rounded-tr-none shadow-sm dark:bg-purple-600 dark:text-white dark:border-purple-500/50"
    : "bg-white border border-gray-200/60 rounded-2xl rounded-tl-none shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/70";

  const toggleColor = isOwn
    ? "text-violet-600 dark:text-purple-200 hover:text-violet-800"
    : "text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white";

  const fromColor = isOwn
    ? "from-violet-50 dark:from-purple-600"
    : "from-white dark:from-slate-800";

  const timestamp = note.created_at
    ? new Date(note.created_at).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`max-w-[78%] w-fit px-4 py-3 overflow-hidden ${bubbleBase}`}
      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
    >
      {attachment && (
        <div className={text ? "mb-2.5" : ""}>
          {isImageAttachment(attachment) ? (
            <ImageAttachmentPreview
              url={attachment.url}
              name={attachment.name}
              onClick={() => onImageClick(attachment.url, attachment.name)}
            />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadAttachment(attachment.url, attachment.name);
              }}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isOwn
                  ? "bg-white/70 hover:bg-white text-slate-800 border-violet-200/80 dark:bg-white/15 dark:hover:bg-white/25 dark:text-white dark:border-white/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
              }`}
              title="Dosyayı indir"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-600/10 dark:bg-white/10 flex items-center justify-center shrink-0 pointer-events-none">
                <FileText className="w-4 h-4 text-violet-600 dark:text-violet-300" />
              </div>
              <div className="min-w-0 flex-1 pointer-events-none">
                <p className="text-xs font-semibold truncate">{attachment.name}</p>
                {attachment.size ? (
                  <p className="text-[10px] opacity-70">{formatAttachmentSize(attachment.size)}</p>
                ) : null}
              </div>
              <Download className="w-4 h-4 shrink-0 opacity-75 pointer-events-none" />
            </button>
          )}
        </div>
      )}

      {text && (
        <div className="relative">
          <div
            className={`text-sm text-gray-800 dark:text-inherit leading-relaxed whitespace-pre-wrap break-words overflow-hidden ${
              isLong && !expanded ? "max-h-[160px]" : "max-h-none"
            }`}
            style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {renderMessageWithLinks(text)}
          </div>

          {isLong && !expanded && (
            <div
              className={`absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t ${fromColor} to-transparent`}
            />
          )}
        </div>
      )}

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`mt-1.5 text-xs font-semibold transition-colors ${toggleColor}`}
        >
          {expanded ? "Daha az göster" : "Devamını oku"}
        </button>
      )}

      <span className="text-[11px] text-gray-400 dark:text-slate-300/80 mt-2 text-right block select-none">
        {timestamp}
      </span>
    </div>
  );
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const router = useRouter();

  const focusMessageTextarea = () => {
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 30);
  };

  useEffect(() => {
    if (!isSubmitting && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      focusMessageTextarea();
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [notes]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 150);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 150 ? "auto" : "hidden";
  };

  const attachFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Dosya boyutu 50 MB'ı geçemez.");
      return;
    }
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    if (file.type.startsWith("image/")) {
      setPendingPreviewUrl(URL.createObjectURL(file));
    } else {
      setPendingPreviewUrl(null);
    }
  };

  const clearAttachment = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    attachFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault();
          const ext = blob.type.split("/")[1] || "png";
          const namedFile = new File([blob], `ekran-goruntusu-${Date.now()}.${ext}`, {
            type: blob.type,
          });
          attachFile(namedFile);
          toast.success("Ekran görüntüsü eklendi.");
          break;
        }
      }
    }
  };

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !pendingFile) return;

    const fileToUpload = pendingFile;
    const localPreview = pendingPreviewUrl;

    // CASE 1: Text-only message — instant WhatsApp/Instagram feel (zero spinner, zero input lock)
    if (!fileToUpload) {
      const finalPayload = encodeContentWithAttachment(trimmed, null);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const optimistic: ProjectNote = {
        id: tempId,
        project_id: projectId,
        user_id: currentUserId,
        content: finalPayload,
        created_at: new Date().toISOString(),
        author_name: currentUserName,
        author_avatar: currentUserAvatar,
      };

      setNotes((prev) => [...prev, optimistic]);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowY = "hidden";
      }
      focusMessageTextarea();

      try {
        const result = await addProjectNoteAction(projectId, finalPayload);
        if ("error" in result) {
          setNotes((prev) => prev.filter((n) => n.id !== tempId));
          toast.error(result.error);
        } else {
          setNotes((prev) => {
            const alreadyHasReal = prev.some((n) => n.id === result.note.id);
            if (alreadyHasReal) {
              return prev.filter((n) => n.id !== tempId);
            }
            return prev.map((n) => (n.id === tempId ? result.note : n));
          });
          router.refresh();
        }
      } catch (err: any) {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        toast.error(err?.message || "Mesaj gönderilemedi.");
      }
      return;
    }

    // CASE 2: Attachment / screenshot upload — show upload indicator and reset in finally
    if (isSubmitting) return;
    shouldRestoreFocusRef.current = true;
    setIsSubmitting(true);
    focusMessageTextarea();

    try {
      const uploadedAttachment = await uploadChatAttachment(
        fileToUpload,
        `project-${projectId}`
      );

      const finalPayload = encodeContentWithAttachment(trimmed, uploadedAttachment);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const optimistic: ProjectNote = {
        id: tempId,
        project_id: projectId,
        user_id: currentUserId,
        content: finalPayload,
        created_at: new Date().toISOString(),
        author_name: currentUserName,
        author_avatar: currentUserAvatar,
      };

      setNotes((prev) => [...prev, optimistic]);
      setContent("");
      setPendingFile(null);
      setPendingPreviewUrl(null);
      if (localPreview) URL.revokeObjectURL(localPreview);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowY = "hidden";
      }

      const result = await addProjectNoteAction(projectId, finalPayload);

      if ("error" in result) {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        setContent(trimmed);
        toast.error(result.error);
      } else {
        setNotes((prev) => {
          const alreadyHasReal = prev.some((n) => n.id === result.note.id);
          if (alreadyHasReal) {
            return prev.filter((n) => n.id !== tempId);
          }
          return prev.map((n) => (n.id === tempId ? result.note : n));
        });
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || "Mesaj gönderilemedi.");
    } finally {
      setIsSubmitting(false);
      focusMessageTextarea();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="w-full border border-gray-200/70 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-50 dark:bg-slate-800">
          <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-slate-100 leading-none">
            Proje Notları ve Tartışma Alanı
          </p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1">
            Sadece ekip üyeleri görebilir • Dosya yükleyebilir veya Ctrl+V ile ekran görüntüsü yapıştırabilirsiniz
          </p>
        </div>
      </div>

      {/* Expanded Message area */}
      <div
        ref={listRef}
        className="flex-1 min-h-[420px] sm:min-h-[480px] max-h-[640px] overflow-y-auto px-4 sm:px-6 py-5 flex flex-col gap-4 bg-[#F9FAFB] dark:bg-slate-950/90"
      >
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-2.5">
            <MessageSquare className="w-8 h-8 text-gray-300 dark:text-slate-600" />
            <p className="text-sm text-gray-400 dark:text-slate-500">
              Henüz not yok. İlk notu veya dosyayı sen paylaş!
            </p>
          </div>
        ) : (
          notes.map((note) => {
            const isOwn = note.user_id === currentUserId;
            return (
              <div
                key={note.id}
                className={`flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  isOwn ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="shrink-0 self-end mb-0.5">
                  <Avatar src={note.author_avatar} name={note.author_name ?? "?"} size="sm" />
                </div>

                <div
                  className={`flex flex-col min-w-0 flex-1 ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwn && (
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 mb-1 ml-1">
                      {note.author_name ?? "Üye"}
                    </span>
                  )}
                  <MessageBubble
                    note={note}
                    isOwn={isOwn}
                    onImageClick={(url, name) => setLightboxImage({ url, name })}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Attachment Preview Bar */}
      {pendingFile && (
        <div className="px-4 py-2.5 bg-violet-50/70 dark:bg-slate-800/80 border-t border-violet-100 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {pendingPreviewUrl ? (
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-violet-200 dark:border-slate-600 shrink-0">
                <img
                  src={pendingPreviewUrl}
                  alt={pendingFile.name}
                  className="w-full h-full object-cover"
                />
                {isSubmitting && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 text-violet-600 dark:text-violet-300 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {pendingFile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isSubmitting ? "Yükleniyor..." : formatAttachmentSize(pendingFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={clearAttachment}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors shrink-0 disabled:opacity-40"
            title="Eki kaldır"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white/95 dark:bg-slate-900 backdrop-blur-sm border-t border-gray-100 dark:border-slate-800 px-3 sm:px-4 py-3.5 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_CHAT_FILES}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-violet-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-violet-300 border border-slate-200/80 dark:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
            title="Dosya veya görsel ekle"
          >
            <Paperclip className="w-4 h-4 pointer-events-none" />
          </button>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Bir şeyler yazın..."
            rows={1}
            maxLength={100000}
            readOnly={isSubmitting}
            className="flex-1 min-h-[44px] max-h-[150px] resize-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700 focus:dark:border-purple-500 placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all leading-relaxed focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 read-only:opacity-70 overflow-hidden"
          />

          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            disabled={isSubmitting || (!content.trim() && !pendingFile)}
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 bg-[#7C3AFF] hover:bg-[#6D28D9] text-white shadow-sm active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin pointer-events-none" />
            ) : (
              <Send className="w-4 h-4 pointer-events-none" />
            )}
          </button>
        </form>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full mb-2 px-1 text-white">
              <span className="text-xs font-medium truncate max-w-md">
                {lightboxImage.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadAttachment(lightboxImage.url, lightboxImage.name)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="İndir"
                >
                  <Download className="w-4 h-4 pointer-events-none" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
