import { createClient } from "@/utils/supabase/client";

export interface ChatAttachment {
  url: string;
  name: string;
  type: string;
  size?: number;
}

export const ACCEPTED_CHAT_FILES =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip";

const ATTACHMENT_REGEX = /\[\[ATTACHMENT:(\{[\s\S]*?\})\]\]/;

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf(".");
  const ext = lastDot !== -1 ? name.substring(lastDot).toLowerCase() : "";
  const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
  const cleanBase = base
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return (cleanBase || "dosya") + ext;
}

export function isImageAttachment(att?: ChatAttachment | null): boolean {
  if (!att) return false;
  if (att.type && att.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(att.name || att.url || "");
}

export function formatAttachmentSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(1)} MB`;
}

export async function uploadChatAttachment(
  file: File,
  folder: string
): Promise<ChatAttachment> {
  const supabase = createClient();
  const safeName = sanitizeFileName(file.name || `ekran-goruntusu-${Date.now()}.png`);
  const path = `chat-attachments/${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("project-files").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "Dosya yüklenemedi.");
  }

  const { data } = supabase.storage.from("project-files").getPublicUrl(path);
  return {
    url: data.publicUrl,
    name: file.name || safeName,
    type: file.type || "application/octet-stream",
    size: file.size,
  };
}

export function encodeContentWithAttachment(
  text: string,
  attachment?: ChatAttachment | null
): string {
  const cleanText = text.trim();
  if (!attachment) return cleanText;
  const payload = JSON.stringify({
    url: attachment.url,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
  });
  return cleanText
    ? `${cleanText}\n[[ATTACHMENT:${payload}]]`
    : `[[ATTACHMENT:${payload}]]`;
}

export function parseContentWithAttachment(
  rawContent: string,
  metadata?: any
): { text: string; attachment: ChatAttachment | null } {
  const content = rawContent || "";
  let attachment: ChatAttachment | null = metadata?.attachment ?? null;

  const match = content.match(ATTACHMENT_REGEX);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && parsed.url) {
        attachment = parsed as ChatAttachment;
      }
    } catch {
      // ignore invalid JSON
    }
  }

  const text = content.replace(ATTACHMENT_REGEX, "").trim();
  return { text, attachment };
}
