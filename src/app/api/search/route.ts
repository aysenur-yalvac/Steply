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

  // ── Users (unaccent search for Turkish character support, exclude self) ──
  const { data: userData, error: rpcError } = await admin
    .rpc("search_profiles_unaccent", { search_query: q });

  if (rpcError) {
    console.error(`[search] RPC error for q="${q}":`, rpcError.message, rpcError);
  }

  // Exclude only by ID — never by name (multiple accounts may share a name)
  const filteredUsers = (userData ?? []).filter((p: { id: string }) => p.id !== user.id);

  console.log(`[search] q="${q}" — RPC returned ${userData?.length ?? 0} total, ${filteredUsers.length} after self-exclusion:`, filteredUsers.map((u: { full_name: string }) => u.full_name));

  const users = filteredUsers
    .slice(0, 4)
    .map(({ id, full_name, avatar_url }: { id: string; full_name: string; avatar_url: string | null }) => ({
      id,
      full_name: full_name ?? "",
      avatar_url: avatar_url ?? null,
    }));

  return NextResponse.json({ projects, users });
}
