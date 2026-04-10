import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json([]);

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  // Return projects that are either:
  //   - owned by the current user (they can always see their own private projects), OR
  //   - not private (is_private = false or null)
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, student_id, is_private")
    .ilike("title", `%${q}%`)
    .order("title")
    .limit(20); // fetch more, then filter

  if (error) return NextResponse.json([], { status: 500 });

  const filtered = (data ?? [])
    .filter((p) => p.student_id === user.id || !p.is_private)
    .slice(0, 8)
    .map(({ id, title }) => ({ id, title }));

  return NextResponse.json(filtered);
}
