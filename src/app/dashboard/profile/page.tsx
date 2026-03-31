import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';
import { BackButton } from '@/components/ui/back-button';
import { Avatar } from '@/components/ui/avatar';

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

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="mb-6">
          <BackButton href="/dashboard" variant="light" />
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name || 'U'}
            size="lg"
            className="border-2 border-[#7C3AFF]/20"
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
            <p className="text-slate-500">Manage your personal information and social links.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-rose-500/5">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name || 'U'}
              size="lg"
              className="border-2 border-slate-200 shadow-inner"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-800">{profile.full_name || 'Unnamed User'}</h2>
              <div className="flex items-center gap-2 text-dusty-rose mt-1">
                <span className="capitalize text-sm font-bold tracking-wide">
                  {profile.role === 'teacher' ? 'Teacher Account' : 'Student Account'}
                </span>
              </div>
            </div>
          </div>

          <ProfileForm profile={profile} email={user.email || ''} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
