import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { classifyEmail } from '@/lib/email-classification';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user?.email) {
      // SSO Login / Signup - apply institutional domain profile rules
      const classification = classifyEmail(data.user.email);
      if (classification.role !== null) {
        const updates: Record<string, string> = { role: classification.role };
        if (classification.teacherStatus) {
          updates.teacher_status = classification.teacherStatus;
        }
        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", data.user.id);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
