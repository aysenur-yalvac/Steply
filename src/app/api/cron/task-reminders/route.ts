import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  buildNotificationEmailHtml,
  getRecipientNotificationContext,
  sendResendEmail,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://mustbacademy.com";

async function processTaskReminders() {
  const admin = createAdminClient();
  const now = Date.now();
  // Cover tasks whose due_date timestamp is within the next 24 hours
  // (or today's date whose 00:00 UTC timestamp is within the last 24 hours)
  const windowStartIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const windowEndIso = new Date(now + 24 * 60 * 60 * 1000).toISOString();

  let sentCount = 0;
  let scannedCount = 0;

  // 1. Scan incomplete project_tasks with due_date within the 24-hour window and reminder_sent != true
  const { data: projectTasks, error: ptErr } = await admin
    .from("project_tasks")
    .select(
      "id, project_id, title, is_completed, due_date, assigned_to, assignee_id, reminder_sent"
    )
    .eq("is_completed", false)
    .not("due_date", "is", null)
    .gte("due_date", windowStartIso)
    .lte("due_date", windowEndIso);

  if (ptErr) {
    console.error("[task-reminders] project_tasks query error:", ptErr);
  }

  const pendingProjectTasks = (projectTasks ?? []).filter(
    (t: any) => t.reminder_sent !== true
  );

  if (pendingProjectTasks.length > 0) {
    const projectIds = Array.from(
      new Set(
        pendingProjectTasks
          .map((t: any) => t.project_id as string)
          .filter(Boolean)
      )
    );
    const { data: projects } =
      projectIds.length > 0
        ? await admin
            .from("projects")
            .select("id, title, student_id, deleted_at")
            .in("id", projectIds)
        : { data: [] as any[] };

    const projectMap = new Map(
      (projects ?? []).map((p: any) => [p.id as string, p])
    );

    for (const task of pendingProjectTasks) {
      scannedCount++;
      const proj = projectMap.get(task.project_id);
      if (proj?.deleted_at) continue;

      const recipientUserId: string | null =
        task.assigned_to || task.assignee_id || proj?.student_id || null;
      if (!recipientUserId) continue;

      const taskTitle = (task.title || "Görev").trim();
      const { email, fullName, preferences } =
        await getRecipientNotificationContext(recipientUserId);

      // Even if user disabled email_task_deadline, mark reminder_sent so we don't repeatedly scan it
      if (!preferences.email_task_deadline) {
        await admin
          .from("project_tasks")
          .update({ reminder_sent: true } as any)
          .eq("id", task.id);
        continue;
      }

      if (!email) continue;

      const reminderMessage = `‘${taskTitle}’ görevini tamamlamanız için son 24 saat! Tamamlamadıysanız tamamlamayı unutmayınız.`;
      const ctaUrl = task.project_id
        ? `${SITE_BASE_URL}/dashboard/projects/${task.project_id}`
        : `${SITE_BASE_URL}/dashboard`;

      const html = buildNotificationEmailHtml({
        recipientName: fullName,
        badgeText: "Son 24 Saat Görev Hatırlatması",
        title: `‘${taskTitle}’ Görevi İçin Son 24 Saat!`,
        body: reminderMessage,
        ctaLabel: "Göreve Git ve Tamamla",
        ctaUrl,
      });

      const delivered = await sendResendEmail({
        to: email,
        subject: `‘${taskTitle}’ görevini tamamlamanız için son 24 saat! - Must-b Academy`,
        html,
      });

      if (delivered) {
        sentCount++;
        await admin
          .from("project_tasks")
          .update({ reminder_sent: true } as any)
          .eq("id", task.id);
      }
    }
  }

  // 2. Scan incomplete agenda_tasks with due_date within the 24-hour window and reminder_sent != true
  const { data: agendaTasks, error: atErr } = await admin
    .from("agenda_tasks")
    .select(
      "id, user_id, title, task_title, due_date, is_completed, reminder_sent"
    )
    .eq("is_completed", false)
    .not("due_date", "is", null)
    .gte("due_date", windowStartIso)
    .lte("due_date", windowEndIso);

  if (atErr) {
    console.error("[task-reminders] agenda_tasks query error:", atErr);
  }

  const pendingAgendaTasks = (agendaTasks ?? []).filter(
    (t: any) => t.reminder_sent !== true
  );

  for (const task of pendingAgendaTasks) {
    scannedCount++;
    const recipientUserId: string | null = task.user_id || null;
    if (!recipientUserId) continue;

    const taskTitle = (task.title || task.task_title || "Görev").trim();
    const { email, fullName, preferences } =
      await getRecipientNotificationContext(recipientUserId);

    if (!preferences.email_task_deadline) {
      await admin
        .from("agenda_tasks")
        .update({ reminder_sent: true } as any)
        .eq("id", task.id);
      continue;
    }

    if (!email) continue;

    const reminderMessage = `‘${taskTitle}’ görevini tamamlamanız için son 24 saat! Tamamlamadıysanız tamamlamayı unutmayınız.`;
    const ctaUrl = `${SITE_BASE_URL}/dashboard/agenda`;

    const html = buildNotificationEmailHtml({
      recipientName: fullName,
      badgeText: "Son 24 Saat Görev Hatırlatması",
      title: `‘${taskTitle}’ Görevi İçin Son 24 Saat!`,
      body: reminderMessage,
      ctaLabel: "Ajandaya Git ve Tamamla",
      ctaUrl,
    });

    const delivered = await sendResendEmail({
      to: email,
      subject: `‘${taskTitle}’ görevini tamamlamanız için son 24 saat! - Must-b Academy`,
      html,
    });

    if (delivered) {
      sentCount++;
      await admin
        .from("agenda_tasks")
        .update({ reminder_sent: true } as any)
        .eq("id", task.id);
    }
  }

  return { scannedCount, sentCount };
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processTaskReminders();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[api/cron/task-reminders] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Cron execution failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
