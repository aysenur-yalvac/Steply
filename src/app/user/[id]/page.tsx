import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { Github, MapPin, FolderOpen, ExternalLink, Lock } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  // Fetch the target profile
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, bio, github_url, institution, is_public, role")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  // Who is viewing?
  const supabase = await createClient();
  const { data: { user: viewer } } = await supabase.auth.getUser();
  const isSelf = viewer?.id === id;

  // If profile is private and viewer is not the owner → 404
  if (profile.is_public === false && !isSelf) notFound();

  // Fetch public projects owned by this user
  const { data: projectRows } = await admin
    .from("projects")
    .select("id, title, description, progress_percentage, start_date, end_date")
    .eq("student_id", id)
    .eq("is_private", false)
    .order("created_at", { ascending: false });

  const projects = projectRows ?? [];

  const cleanDesc = (raw: string) => raw.replace(/\[.*?\]/g, "").trim();

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f0f4ff 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Back button */}
        <div className="mb-8">
          <BackButton href="/dashboard" variant="light" />
        </div>

        {/* Profile header card */}
        <div
          className="rounded-3xl p-8 mb-8 shadow-xl"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name ?? "?"}
              size="lg"
              className="w-20 h-20 text-2xl"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {profile.full_name ?? "Steply Member"}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {profile.role && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#7C3AFF]/10 text-[#7C3AFF] border border-[#7C3AFF]/20 uppercase tracking-wide">
                    {profile.role}
                  </span>
                )}
                {profile.institution && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.institution}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}

              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#7C3AFF] hover:text-purple-800 transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Projects section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#7C3AFF]" />
            Public Projects
            <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
              {projects.length}
            </span>
          </h2>

          {projects.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{
                background: "rgba(255,255,255,0.40)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.55)",
              }}
            >
              <Lock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No public projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => {
                const isCompleted = p.progress_percentage === 100;
                const desc = cleanDesc(p.description ?? "");
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    className="group block rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.65)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#7C3AFF] transition-colors">
                        {p.title}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#7C3AFF] shrink-0 transition-colors mt-0.5" />
                    </div>

                    {desc && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                        {desc}
                      </p>
                    )}

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isCompleted ? "bg-emerald-500" : "bg-[#7C3AFF]"}`}
                        style={{ width: `${p.progress_percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                      {isCompleted ? "Completed" : `${p.progress_percentage}% complete`}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
