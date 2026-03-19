'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Save, Mail, User, Phone, FileText, Github, Linkedin, Loader2, Image as ImageIcon, Landmark } from 'lucide-react';
const TEACHER_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Robert&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mary&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=William&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Patricia&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Richard&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Linda&backgroundColor=transparent"
];

const STUDENT_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ryan&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Wyatt&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=transparent"
];

export default function ProfileForm({ 
  profile, 
  email,
  userId
}: { 
  profile: any;
  email: string;
  userId: string;
}) {
  const avatars = profile?.role === 'teacher' ? TEACHER_AVATARS : STUDENT_AVATARS;
  const [isPending, setIsPending] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || avatars[0]);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    formData.append('id', userId);
    
    try {
      const result = await updateProfileAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully!', { icon: '✨' });
      }
    } catch(e) {
      toast.error('An error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      
      <input type="hidden" name="avatar_url" value={selectedAvatar} />
      
      {/* Avatar Selection */}
      <div className="flex flex-col gap-3 mb-2">
         <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-dusty-rose" /> Choose Avatar
         </label>
         <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100">
            {avatars.map(avatar => (
               <button 
                 key={avatar} 
                 type="button"
                 onClick={() => setSelectedAvatar(avatar)}
                 className={`w-14 h-14 rounded-full border-4 transition-all duration-300 ${selectedAvatar === avatar ? 'border-dusty-rose shadow-md scale-110' : 'border-transparent hover:border-slate-300 hover:opacity-80'}`}
               >
                 <img src={avatar} alt="Avatar option" className="w-full h-full object-cover rounded-full bg-white shadow-sm" />
               </button>
            ))}
         </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
             <User className="w-4 h-4 text-dusty-rose" /> Full Name
          </label>
          <input 
            type="text" 
            name="full_name"
            defaultValue={profile?.full_name || ''}
            placeholder="Your Name and Surname"
            required
            minLength={2}
            className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-dusty-rose/10 focus:border-dusty-rose/30 transition-all shadow-sm"
          />
        </div>

        <div className="flex-[0.8] flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
             <Mail className="w-4 h-4 text-dusty-rose" /> Registered Email
          </label>
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed shadow-inner"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 relative z-0">
        <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
           <Phone className="w-4 h-4 text-dusty-rose" /> Phone Number
        </label>
        <input 
          type="tel" 
          name="phone_number"
          defaultValue={profile?.phone_number || ''}
          placeholder="+1 234 567 8900"
          className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-dusty-rose/10 focus:border-dusty-rose/30 transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
           <FileText className="w-4 h-4 text-dusty-rose" /> Biography
        </label>
        <textarea 
          name="bio"
          defaultValue={profile?.bio || ''}
          placeholder="Tell us a little bit about yourself..."
          rows={4}
          className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-dusty-rose/10 focus:border-dusty-rose/30 transition-all shadow-sm resize-none"
        />
      </div>

      <div className="flex flex-col gap-2 relative z-0">
        <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
           <Landmark className="w-4 h-4 text-dusty-rose" /> School / Institution
        </label>
        <input 
          type="text" 
          name="institution"
          defaultValue={profile?.institution || ''}
          placeholder={profile?.role === 'teacher' ? "University of Technology" : "Engineering Faculty"}
          className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-dusty-rose/10 focus:border-dusty-rose/30 transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
             <Github className="w-4 h-4 text-dusty-rose" /> GitHub URL
          </label>
          <input 
            type="url" 
            name="github_url"
            defaultValue={profile?.github_url || ''}
            placeholder="https://github.com/username"
            className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-dusty-rose/10 focus:border-dusty-rose/30 transition-all shadow-sm"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
             <Linkedin className="w-4 h-4 text-dusty-rose" /> LinkedIn URL
          </label>
          <input 
            type="url" 
            name="linkedin_url"
            defaultValue={profile?.linkedin_url || ''}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-dusty-rose/10 focus:border-dusty-rose/30 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </button>
      </div>
      
    </form>
  );
}
