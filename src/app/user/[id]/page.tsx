import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import {
  Github, Linkedin, Globe, Twitter, Building2,
  FolderOpen, ExternalLink, Lock, ShieldOff,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  // Minimal, safe select — only columns guaranteed to exist
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, is_public, bio, role, github_url, linkedin_url, institution")
    .eq("id", id)
    .single();

  if (profileError) {
    console.error(`[DEBUG] Profile fetch error for ID ${id}:`, profileError.message);
  }

  if (!profile) {
    console.error(`[DEBUG] Profile not found for ID: ${id}`);
    notFound();
  }

  // Who is viewing?
  const supabase = await createClient();
  const { data: { user: viewer } } = await supabase.auth.getUser();
  const isSelf = viewer?.id === id;

  // is_public: true → public, false → private, null → treat as public
  const isPrivate = profile.is_public === false;

  console.log(`[DEBUG] Profile ${id} | is_public=${profile.is_public} | isSelf=${isSelf}`);

  // Fetch public projects — only when profile is public or viewer is owner
  const projects = (!isPrivate || isSelf)
    ? (await admin
        .from("projects")
        .select("id, title, description, progress_percentage")
        .eq("student_id", id)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .then(({ data }) => data ?? []))
    : [];

  const cleanDesc = (raw: string) => raw.replace(/\[.*?\]/g, "").trim();

  const socialLinks = [
    { url: profile.github_url,   icon: <Github   className="w-4 h-4" />, label: "GitHub"   },
    { url: profile.linkedin_url, icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn" },
    { url: (profile as any).twitter_url, icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
    { url: (profile as any).website_url, icon: <Globe   className="w-4 h-4" />, label: "Website" },
  ].filter((l) => !!l.url);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f0f4ff 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <BackButton href="/dashboard" variant="light" />
        </div>

        {/* ── Profile header ─────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-8 mb-6 shadow-xl"
          style={{
            background: "rgba(255,255,255,0.60)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.75)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name ?? "?"}
                size="lg"
                className="w-24 h-24 text-3xl ring-4 ring-white shadow-lg"
              />
              {profile.role && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#7C3AFF] text-white shadow-md uppercase tracking-wider">
                  {profile.role}
                </span>
              )}
            </div>

            {/* Name + info */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {profile.full_name ?? "Steply Member"}
              </h1>

              {/* Private notice */}
              {isPrivate && (
                <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <ShieldOff className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-500 font-medium">
                    This profile is private. You can only see the name and avatar.
                  </p>
                </div>
              )}

              {/* Public info */}
              {!isPrivate && (
                <>
                  {profile.institution && (
                    <span className="flex items-center gap-1.5 mt-2 text-sm text-slate-500 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {profile.institution}
                    </span>
                  )}

                  {profile.bio && (
                    <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-xl">
                      {profile.bio}
                    </p>
                  )}

                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {socialLinks.map(({ url, icon, label }) => (
                        <a
                          key={label}
                          href={url!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#7C3AFF] bg-[#7C3AFF]/10 border border-[#7C3AFF]/20 hover:bg-[#7C3AFF]/20 transition-colors"
                        >
                          {icon}
                          {label}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Projects — only for public profiles ────────────────────────── */}
        {!isPrivate && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#7C3AFF]" />
              Public Projects
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[#7C3AFF]/10 text-[#7C3AFF] text-xs font-bold">
                {projects.length}
              </span>
            </h2>

            {projects.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{
                  background: "rgba(255,255,255,0.45)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.60)",
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
                      className="group block rounded-2xl p-5 transition-all hover:shadow-xl hover:-translate-y-0.5"
                      style={{
                        background: "rgba(255,255,255,0.60)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.70)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#7C3AFF] transition-colors">
                          {p.title}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#7C3AFF] shrink-0 mt-0.5 transition-colors" />
                      </div>

                      <div className="mb-3">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                            ↻ In Progress
                          </span>
                        )}
                      </div>

                      {desc && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                          {desc}
                        </p>
                      )}

                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isCompleted ? "bg-emerald-500" : "bg-[#7C3AFF]"}`}
                          style={{ width: `${p.progress_percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                        {p.progress_percentage}% complete
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
