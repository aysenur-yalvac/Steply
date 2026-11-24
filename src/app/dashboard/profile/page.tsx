import { getCachedUser, getCachedProfile } from '@/lib/auth-cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';
import { Github, Linkedin, Twitter, Globe, MapPin, Building2, Pencil, GraduationCap } from 'lucide-react';
import ActivityChartCard from '@/components/ui/activity-chart-card';
import BadgeDisplay from '@/components/profile/BadgeDisplay';
import { getUserActivitiesAction } from '@/lib/actions';
import { sanitizeInstitution } from '@/lib/utils';

export default async function ProfilePage() {
  const user = await getCachedUser();
  if (!user) redirect('/auth/login');

  // Parallel fetch: cached profile + activity data
  const [profile, activities] = await Promise.all([
    getCachedProfile(),
    getUserActivitiesAction(user.id),
  ]);

  if (!profile) {
    return <div className="p-8 text-center text-red-400">Profil bilgileri bulunamadı.</div>;
  }

  const socialLinks = [
    { href: profile.github_url,   icon: <Github   className="w-4 h-4" />, label: 'GitHub'    },
    { href: profile.linkedin_url, icon: <Linkedin  className="w-4 h-4" />, label: 'LinkedIn'  },
    { href: profile.twitter_url,  icon: <Twitter   className="w-4 h-4" />, label: 'X / Twitter' },
    { href: profile.website_url,  icon: <Globe     className="w-4 h-4" />, label: 'Web Sitesi'   },
  ].filter((s) => s.href);

  const badges: string[] = profile.badges ?? [];
  const totalScore = profile.total_score ?? 0;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-transparent p-4 sm:p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">

        <div className="mb-6 flex items-center justify-between">
          <BackButton href="/dashboard" variant="light" />
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-[#7C3AFF] text-white text-sm font-semibold shadow-md shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Profili Düzenle
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-rose-500/5 overflow-hidden">

          {/* Header banner */}
          <div className="h-24 bg-gradient-to-r from-violet-100 via-purple-50 to-slate-100 dark:from-violet-950/50 dark:via-slate-900 dark:to-slate-900" />

          {/* Avatar + name */}
          <div className="px-4 sm:px-8 pb-6">
            <div className="-mt-12 mb-4">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name || 'U'}
                size="lg"
                className="border-4 border-white dark:border-slate-900 shadow-lg w-20 h-20"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.full_name || 'İsimsiz Kullanıcı'}</h1>
                  {badges.length > 0 && <BadgeDisplay badges={badges} size="sm" />}
                </div>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 capitalize tracking-wide dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80">
                  {profile.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                </span>
                {totalScore > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm shadow-amber-200/60 dark:bg-none">
                    🏆 {totalScore.toLocaleString()} puan
                  </span>
                )}
              </div>

              {/* Location / Company / University badges */}
              <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                {profile.company && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Building2 className="w-3.5 h-3.5" />
                    {profile.company}
                  </span>
                )}
                {(profile.location || profile.country) && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <MapPin className="w-3.5 h-3.5" />
                    {[profile.location, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {sanitizeInstitution(
                  profile.institution ||
                  profile.university ||
                  (user.user_metadata?.institution as string | null)
                ) && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {sanitizeInstitution(
                      profile.institution ||
                      profile.university ||
                      (user.user_metadata?.institution as string | null)
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-5">
                {profile.bio}
              </p>
            )}

            {/* Score stat card */}
            {totalScore > 0 && (
              <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5 grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1 flex flex-col gap-1 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-slate-900 border border-amber-100 dark:border-amber-900/40 py-4 shadow-sm">
                  <span className="text-2xl">🏆</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tabular-nums leading-none">
                    {totalScore.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest">Toplam Puan</span>
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <ActivityChartCard activities={activities} totalScore={totalScore} className="border-slate-100 shadow-sm h-full" />
                </div>
              </div>
            )}
            {totalScore === 0 && (
              <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5">
                <ActivityChartCard activities={activities} totalScore={totalScore} className="border-0 shadow-none p-0" />
              </div>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                {socialLinks.map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href!}
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
          </div>
        </div>
      </div>
    </div>
  );
}
