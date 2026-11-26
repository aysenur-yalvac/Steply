import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";

export interface NotificationPreferences {
  in_app_invites: boolean;
  email_invites: boolean;
  in_app_tasks: boolean;
  email_tasks: boolean;
  email_task_deadline: boolean;
  in_app_messages: boolean;
  email_messages: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  in_app_invites: true,
  email_invites: true,
  in_app_tasks: true,
  email_tasks: true,
  email_task_deadline: true,
  in_app_messages: true,
  email_messages: true,
};

export function normalizeNotificationPreferences(
  raw: unknown
): NotificationPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;
  return {
    in_app_invites:
      typeof obj.in_app_invites === "boolean"
        ? obj.in_app_invites
        : DEFAULT_NOTIFICATION_PREFERENCES.in_app_invites,
    email_invites:
      typeof obj.email_invites === "boolean"
        ? obj.email_invites
        : DEFAULT_NOTIFICATION_PREFERENCES.email_invites,
    in_app_tasks:
      typeof obj.in_app_tasks === "boolean"
        ? obj.in_app_tasks
        : DEFAULT_NOTIFICATION_PREFERENCES.in_app_tasks,
    email_tasks:
      typeof obj.email_tasks === "boolean"
        ? obj.email_tasks
        : DEFAULT_NOTIFICATION_PREFERENCES.email_tasks,
    email_task_deadline:
      typeof obj.email_task_deadline === "boolean"
        ? obj.email_task_deadline
        : DEFAULT_NOTIFICATION_PREFERENCES.email_task_deadline,
    in_app_messages:
      typeof obj.in_app_messages === "boolean"
        ? obj.in_app_messages
        : DEFAULT_NOTIFICATION_PREFERENCES.in_app_messages,
    email_messages:
      typeof obj.email_messages === "boolean"
        ? obj.email_messages
        : DEFAULT_NOTIFICATION_PREFERENCES.email_messages,
  };
}

const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://mustbacademy.com";

export function buildNotificationEmailHtml(params: {
  recipientName?: string | null;
  badgeText: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}): string {
  const greetingName = params.recipientName?.trim() || "Üyemiz";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background-color: #0f172a; color: #f8fafc; border-radius: 18px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 22px;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background-color: rgba(124, 58, 255, 0.18); color: #c4b5fd; font-size: 12px; font-weight: 700; letter-spacing: 0.4px;">
          Must-b Academy • ${params.badgeText}
        </span>
      </div>
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #ffffff; text-align: center; line-height: 1.35;">
        ${params.title}
      </h2>
      <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; text-align: center;">
        Merhaba <strong style="color: #ffffff;">${greetingName}</strong>,
      </p>
      <div style="margin: 18px 0 24px 0; padding: 18px 20px; background-color: #1e293b; border-radius: 14px; border: 1px solid #334155; color: #e2e8f0; font-size: 14px; line-height: 1.65; text-align: center;">
        ${params.body}
      </div>
      <div style="text-align: center; margin: 26px 0;">
        <a href="${params.ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 13px 28px; border-radius: 12px; background: linear-gradient(135deg, #7C3AFF 0%, #9333ea 100%); color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none;">
          ${params.ctaLabel}
        </a>
      </div>
      <p style="margin: 22px 0 0 0; font-size: 11px; line-height: 1.5; color: #64748b; text-align: center;">
        Bu e-posta bildirim tercihlerinize göre gönderilmiştir. Bildirim ayarlarınızı Must-b Academy &gt; Ayarlar &gt; Bildirimler bölümünden dilediğiniz zaman güncelleyebilirsiniz.
      </p>
    </div>
  `;
}

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !params.to) return false;
  try {
    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      "Must-b Academy <noreply@mustbacademy.com>";
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("[sendResendEmail] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sendResendEmail] Unexpected error:", err);
    return false;
  }
}

export async function getRecipientNotificationContext(userId: string): Promise<{
  email: string | null;
  fullName: string | null;
  preferences: NotificationPreferences;
  isOnline: boolean;
}> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, school_email, full_name, notification_preferences, last_seen_at")
    .eq("id", userId)
    .maybeSingle();

  let email: string | null =
    (profile as any)?.email || (profile as any)?.school_email || null;

  if (!email) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      email = authUser?.user?.email ?? null;
    } catch {
      // ignore
    }
  }

  const preferences = normalizeNotificationPreferences(
    (profile as any)?.notification_preferences
  );

  const lastSeenRaw = (profile as any)?.last_seen_at as string | null | undefined;
  let isOnline = false;
  if (lastSeenRaw) {
    const diffMs = Date.now() - new Date(lastSeenRaw).getTime();
    // User is considered actively online if seen within the last 90 seconds
    if (Number.isFinite(diffMs) && diffMs >= 0 && diffMs <= 90 * 1000) {
      isOnline = true;
    }
  }

  return {
    email,
    fullName: (profile as any)?.full_name ?? null,
    preferences,
    isOnline,
  };
}

export async function touchUserPresence(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", userId);
  } catch {
    // Non-blocking presence update
  }
}

export type SmartNotificationType =
  | "project_invite"
  | "task"
  | "message"
  | "project";

/**
 * Centralized notification dispatcher that respects the recipient's individual
 * `notification_preferences` JSONB settings for both in-app bell notifications
 * and Resend emails.
 */
export async function dispatchSmartNotification(params: {
  userId: string;
  type: SmartNotificationType;
  title: string;
  body?: string;
  relatedId?: string;
  skipInAppInsert?: boolean;
}): Promise<void> {
  const { userId, type, title, body, relatedId, skipInAppInsert } = params;
  if (!userId) return;

  try {
    const admin = createAdminClient();
    const { email, fullName, preferences, isOnline } =
      await getRecipientNotificationContext(userId);

    const relativeLink = relatedId
      ? relatedId.startsWith("/")
        ? relatedId
        : type === "message" && !relatedId.includes("/")
          ? `/dashboard/messages?userId=${relatedId}`
          : `/dashboard/projects/${relatedId}`
      : "/dashboard";

    const fullUrl = `${SITE_BASE_URL}${relativeLink}`;

    // Determine whether in-app notification bell entry is allowed
    let allowInApp = true;
    if (type === "project_invite") {
      allowInApp = preferences.in_app_invites;
    } else if (type === "task") {
      allowInApp = preferences.in_app_tasks;
    } else if (type === "message") {
      allowInApp = preferences.in_app_messages;
    }

    if (allowInApp && !skipInAppInsert) {
      const { error } = await admin.from("notifications").insert({
        user_id: userId,
        type,
        title,
        content: body || null,
        link: relativeLink,
        is_read: false,
      });
      if (error) {
        console.error(
          "[dispatchSmartNotification] DB insert error:",
          error.message,
          error.code
        );
      }
    }

    // Determine whether email notification should be sent via Resend
    let allowEmail = false;
    let badgeText = "Bildirim";
    let ctaLabel = "Görüntüle";

    if (type === "project_invite") {
      allowEmail = preferences.email_invites;
      badgeText = "Proje Daveti";
      ctaLabel = "Daveti Görüntüle";
    } else if (type === "task") {
      allowEmail = preferences.email_tasks;
      badgeText = "Görev Bildirimi";
      ctaLabel = "Göreve Git";
    } else if (type === "message") {
      // Only send message email when email_messages is true AND the recipient is currently offline
      allowEmail = preferences.email_messages && !isOnline;
      badgeText = "Yeni Mesaj";
      ctaLabel = "Mesajı Yanıtla";
    }

    if (allowEmail && email) {
      const html = buildNotificationEmailHtml({
        recipientName: fullName,
        badgeText,
        title,
        body: body || title,
        ctaLabel,
        ctaUrl: fullUrl,
      });

      await sendResendEmail({
        to: email,
        subject: `${title} - Must-b Academy`,
        html,
      });
    }
  } catch (err) {
    console.error("[dispatchSmartNotification] Unexpected error:", err);
  }
}

/**
 * Checks if a specific task's due_date is within 24 hours and sends the
 * one-time deadline reminder email if `email_task_deadline` is enabled
 * and `reminder_sent` is not yet true.
 */
export async function checkAndSendSingleTaskDeadlineReminder(params: {
  table: "project_tasks" | "agenda_tasks";
  taskId: string;
  taskTitle: string;
  dueDate: string | null | undefined;
  recipientUserId: string | null | undefined;
  projectId?: string | null;
}): Promise<void> {
  const { table, taskId, taskTitle, dueDate, recipientUserId, projectId } = params;
  if (!taskId || !dueDate || !recipientUserId) return;

  try {
    const dueMs = new Date(dueDate).getTime();
    if (!Number.isFinite(dueMs)) return;

    const now = Date.now();
    const within24Hours =
      dueMs >= now - 24 * 60 * 60 * 1000 &&
      dueMs <= now + 24 * 60 * 60 * 1000;
    if (!within24Hours) return;

    const admin = createAdminClient();
    const { data: row } = await admin
      .from(table)
      .select("id, is_completed, reminder_sent")
      .eq("id", taskId)
      .maybeSingle();

    if (!row || (row as any).is_completed || (row as any).reminder_sent === true) {
      return;
    }

    const { email, fullName, preferences } =
      await getRecipientNotificationContext(recipientUserId);

    if (!preferences.email_task_deadline || !email) return;

    const cleanTitle = (taskTitle || "Görev").trim();
    const reminderMessage = `‘${cleanTitle}’ görevini tamamlamanız için son 24 saat! Tamamlamadıysanız tamamlamayı unutmayınız.`;
    const ctaUrl =
      table === "project_tasks" && projectId
        ? `${SITE_BASE_URL}/dashboard/projects/${projectId}`
        : `${SITE_BASE_URL}/dashboard/agenda`;

    const html = buildNotificationEmailHtml({
      recipientName: fullName,
      badgeText: "Son 24 Saat Görev Hatırlatması",
      title: `‘${cleanTitle}’ Görevi İçin Son 24 Saat!`,
      body: reminderMessage,
      ctaLabel:
        table === "project_tasks"
          ? "Göreve Git ve Tamamla"
          : "Ajandaya Git ve Tamamla",
      ctaUrl,
    });

    const delivered = await sendResendEmail({
      to: email,
      subject: `‘${cleanTitle}’ görevini tamamlamanız için son 24 saat! - Must-b Academy`,
      html,
    });

    if (delivered) {
      await admin
        .from(table)
        .update({ reminder_sent: true } as any)
        .eq("id", taskId);
    }
  } catch (err) {
    console.error("[checkAndSendSingleTaskDeadlineReminder] Error:", err);
  }
}

