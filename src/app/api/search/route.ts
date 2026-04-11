import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json({ projects: [], users: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ projects: [], users: [] }, { status: 401 });

  const admin = createAdminClient();

  // ── Projects ─────────────────────────────────────────────────────────────
  const { data: projectData } = await admin
    .from("projects")
    .select("id, title, student_id, is_private")
    .ilike("title", `%${q}%`)
    .order("title")
    .limit(20);

  console.log(`[search] q="${q}" — DB returned ${projectData?.length ?? 0} project(s):`, projectData?.map((p) => p.title));

  const projects = (projectData ?? [])
    .filter((p) => p.student_id === user.id || !p.is_private)
    .slice(0, 5)
    .map(({ id, title }) => ({ id, title }));

  // ── Users (all profiles, exclude self) ───────────────────────────────────
  const { data: userData } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, is_public, role")
    .ilike("full_name", `%${q}%`)
    .neq("id", user.id)
    .limit(10);

  console.log(`[search] q="${q}" — DB returned ${userData?.length ?? 0} user(s):`, userData?.map((u) => u.full_name));

  const users = (userData ?? [])
    .slice(0, 4)
    .map(({ id, full_name, avatar_url }) => ({
      id,
      full_name: full_name ?? "",
      avatar_url: avatar_url ?? null,
    }));

  return NextResponse.json({ projects, users });
}
