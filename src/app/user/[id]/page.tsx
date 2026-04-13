import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { Github, Linkedin, Globe, Twitter, Building2, FolderOpen, ShieldOff } from "lucide-react";
import ProfileProjectsPanel from "@/components/profile/ProfileProjectsPanel";

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
      <div className="max-w-6xl mx-auto px-6 py-10">

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
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-white border border-violet-200 shadow-sm">
                <FolderOpen className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  Public Projects
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {projects.length} project{projects.length !== 1 ? "s" : ""} · publicly visible
                </p>
              </div>
            </div>

            {projects.length === 0 ? (
              /* Global empty state */
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 min-h-[200px] flex flex-col items-center justify-center gap-3 p-8">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <FolderOpen className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">No public projects yet.</p>
              </div>
            ) : (
              <ProfileProjectsPanel projects={projects} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
