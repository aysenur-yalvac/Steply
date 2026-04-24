import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Github, Linkedin, Twitter, Globe, MapPin, Building2, Pencil } from 'lucide-react';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return <div className="p-8 text-center text-red-400">Profile information not found.</div>;
  }

  const socialLinks = [
    { href: profile.github_url, icon: <Github className="w-4 h-4" />, label: 'GitHub' },
    { href: profile.linkedin_url, icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' },
    { href: profile.twitter_url, icon: <Twitter className="w-4 h-4" />, label: 'X / Twitter' },
    { href: profile.website_url, icon: <Globe className="w-4 h-4" />, label: 'Website' },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="mb-6 flex items-center justify-between">
          <BackButton href="/dashboard" variant="light" />
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AFF] text-white text-sm font-semibold shadow-md shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Edit Profile
          </Link>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-xl shadow-rose-500/5 overflow-hidden">

          {/* Header banner */}
          <div className="h-24 bg-gradient-to-r from-violet-100 via-purple-50 to-slate-100" />

          {/* Avatar + name */}
          <div className="px-8 pb-6">
            <div className="-mt-12 mb-4">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name || 'U'}
                size="lg"
                className="border-4 border-white shadow-lg w-20 h-20"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile.full_name || 'Unnamed User'}</h1>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 capitalize tracking-wide">
                  {profile.role === 'teacher' ? 'Teacher' : 'Student'}
                </span>
              </div>

              {/* Company / Location badges */}
              <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                {profile.company && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100">
                    <Building2 className="w-3.5 h-3.5" />
                    {profile.company}
                  </span>
                )}
                {(profile.location || profile.country) && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100">
                    <MapPin className="w-3.5 h-3.5" />
                    {[profile.location, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-5">
                {profile.bio}
              </p>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                {socialLinks.map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium hover:border-violet-300 hover:text-violet-600 transition-colors"
                  >
                    {icon}
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
