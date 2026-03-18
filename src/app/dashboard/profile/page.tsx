import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { User, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import ProfileForm from './ProfileForm';
import Link from 'next/link';

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
        
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors w-fit mb-6 ml-1"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-dusty-rose/10 text-dusty-rose border border-dusty-rose/20">
          <User className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
          <p className="text-slate-500">Manage your personal information and social links.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-rose-500/5">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
           <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-inner overflow-hidden">
             {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
             ) : (
                <User className="w-8 h-8 text-slate-400" />
             )}
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800">{profile.full_name || 'Unnamed User'}</h2>
             <div className="flex items-center gap-2 text-dusty-rose mt-1">
                <span className="capitalize text-sm font-bold tracking-wide">{profile.role === 'teacher' ? 'Teacher Account' : 'Student Account'}</span>
             </div>
           </div>
        </div>

        <ProfileForm profile={profile} email={user.email || ''} userId={user.id} />
        
      </div>
    </div>
    </div>
  );
}
