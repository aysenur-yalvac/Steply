import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { User, Mail, ShieldAlert } from 'lucide-react';
import ProfileForm from './ProfileForm';

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
     return <div className="p-8 text-center text-red-400">Profil bilgisi bulunamadı.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-6">
      <div className="flex flex-col gap-2 mb-8 text-center md:text-left">
         <h1 className="text-3xl font-bold text-white">Profil Yönetimi</h1>
         <p className="text-slate-400">Kişisel bilgilerinizi buradan görüntüleyip yönetebilirsiniz.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800/80">
           <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
             <User className="w-8 h-8 text-indigo-400" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-200">{profile.full_name || 'İsimsiz Kullanıcı'}</h2>
             <div className="flex items-center gap-2 text-slate-400 mt-1">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span className="capitalize text-sm font-medium">{profile.role === 'teacher' ? 'Öğretmen Hesabı' : 'Öğrenci Hesabı'}</span>
             </div>
           </div>
        </div>

        {/* Form Bileşeni Cilent Component olarak ayrıldı (Toast desteklemesi için) */}
        <ProfileForm 
           initialFullName={profile.full_name || ''} 
           email={user.email || ''} 
           userId={user.id} 
        />
        
      </div>
    </div>
  );
}
