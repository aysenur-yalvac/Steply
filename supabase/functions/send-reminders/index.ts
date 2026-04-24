// Steply — Agenda Task Email Reminder Edge Function (Draft)
//
// Deploy: supabase functions deploy send-reminders
// Schedule: In Supabase Dashboard → Edge Functions → Cron → "0 8 * * *" (daily at 08:00 UTC)
//
// Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY=re_xxxxxxxx
//   SITE_URL=https://your-app.vercel.app
//
// npm install resend  (in project root, then redeploy)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://steply.vercel.app";

Deno.serve(async (_req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Find tasks due tomorrow (date = CURRENT_DATE + 1), not completed
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: tasks, error } = await supabase
    .from("agenda_tasks")
    .select("id, task_title, due_date, user_id, profiles!user_id(full_name, email:id)")
    .eq("due_date", tomorrowStr)
    .eq("is_completed", false);

  if (error) {
    console.error("Error fetching tasks:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;

  for (const task of tasks ?? []) {
    // Get user email from auth.users via admin
    const { data: userData } = await supabase.auth.admin.getUserById(task.user_id);
    const email = userData?.user?.email;
    if (!email) continue;

    const fullName = (task as any).profiles?.full_name ?? "there";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Steply <no-reply@steply.app>",
        to: email,
        subject: `⏰ Reminder: "${task.task_title}" is due tomorrow`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <h2 style="color:#7C3AFF">Hi ${fullName} 👋</h2>
            <p>This is a friendly reminder that your agenda task is due <strong>tomorrow</strong>:</p>
            <div style="background:#f5f3ff;border-left:4px solid #7C3AFF;padding:12px 16px;border-radius:8px;margin:16px 0">
              <strong>${task.task_title}</strong><br/>
              <small style="color:#6b7280">Due: ${task.due_date}</small>
            </div>
            <a href="${SITE_URL}/dashboard/agenda"
               style="display:inline-block;background:#7C3AFF;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
              View My Agenda
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Steply — Your Academic Progress Platform</p>
          </div>
        `,
      }),
    });

    if (res.ok) sent++;
    else console.error("Resend error for", email, await res.text());
  }

  return new Response(JSON.stringify({ sent, total: tasks?.length ?? 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});

/*
  HOW TO SCHEDULE (Cron):
  ─────────────────────────────────────────────
  1. Go to Supabase Dashboard → Edge Functions → send-reminders
  2. Click "Schedule" tab
  3. Set cron expression: 0 8 * * *  (runs daily at 08:00 UTC)
  4. Save

  Or use pg_cron (if enabled on your Supabase plan):
  SELECT cron.schedule(
    'daily-task-reminders',
    '0 8 * * *',
    $$
      SELECT net.http_post(
        url := 'https://<project-ref>.supabase.co/functions/v1/send-reminders',
        headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
      );
    $$
  );
*/
