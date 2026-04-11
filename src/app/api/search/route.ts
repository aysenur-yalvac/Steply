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

  // ── Users: unaccent RPC with ilike fallback (exclude self by ID only) ────
  let rawUsers: { id: string; full_name: string; avatar_url: string | null }[] = [];

  const { data: rpcData, error: rpcError } = await admin
    .rpc("search_profiles_unaccent", { search_query: q });

  if (rpcError) {
    // RPC not available yet — fall back to plain ilike (no Turkish normalisation)
    console.warn(`[search] RPC unavailable, falling back to ilike. Error: ${rpcError.message}`);
    const { data: fallbackData, error: fallbackError } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .ilike("full_name", `%${q}%`)
      .limit(10);
    if (fallbackError) {
      console.error(`[search] Fallback ilike also failed: ${fallbackError.message}`);
    }
    rawUsers = (fallbackData ?? []) as typeof rawUsers;
  } else {
    rawUsers = (rpcData ?? []) as typeof rawUsers;
  }

  // Exclude only the currently logged-in user by ID — never filter by name
  const filteredUsers = rawUsers.filter((p) => p.id !== user.id);

  console.log(`[search] q="${q}" — found ${rawUsers.length} total, ${filteredUsers.length} after self-exclusion:`, filteredUsers.map((u) => u.full_name));

  const users = filteredUsers
    .slice(0, 4)
    .map(({ id, full_name, avatar_url }) => ({
      id,
      full_name: full_name ?? "",
      avatar_url: avatar_url ?? null,
    }));

  return NextResponse.json({ projects, users });
}
