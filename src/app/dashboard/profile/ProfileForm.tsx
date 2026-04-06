'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfileAction } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Save, Mail, User, Phone, FileText, Github, Linkedin, Loader2, Image as ImageIcon, Landmark, ChevronDown, Check } from 'lucide-react';

const ALL_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ryan&backgroundColor=c0aaf7",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=d1f4cc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Wyatt&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Robert&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mary&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=William&backgroundColor=c0aaf7",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Patricia&backgroundColor=d1f4cc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Richard&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Luna&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Nova&backgroundColor=c0aaf7",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Orion&backgroundColor=d1f4cc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Stella&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aurora&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Kai&backgroundColor=c0aaf7",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ember&backgroundColor=d1f4cc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Atlas&backgroundColor=ffdfbf",
];

const VISIBLE_COUNT = 5;

function AvatarButton({ avatar, selected, onSelect }: { avatar: string; selected: boolean; onSelect: (a: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(avatar)}
      className="relative w-12 h-12 rounded-full shrink-0 transition-transform duration-200 hover:scale-110 focus-visible:outline-none"
      style={selected ? { boxShadow: "0 0 0 3px #7C3AFF" } : {}}
    >
      <img src={avatar} alt="Avatar option" className="w-full h-full object-cover rounded-full bg-white" />
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#7C3AFF]/30">
          <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export default function ProfileForm({ 
  profile, 
  email,
  userId
}: { 
  profile: any;
  email: string;
  userId: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || ALL_AVATARS[0]);
  const [expanded, setExpanded] = useState(false);
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
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          {/* First row: 5 avatars + More button */}
          <div className="flex items-center gap-3">
            {ALL_AVATARS.slice(0, VISIBLE_COUNT).map(avatar => (
              <AvatarButton key={avatar} avatar={avatar} selected={selectedAvatar === avatar} onSelect={setSelectedAvatar} />
            ))}
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#7C3AFF] hover:text-[#7C3AFF] transition-all duration-200 shrink-0"
              aria-label={expanded ? "Show less" : "Show more"}
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </button>
          </div>

          {/* Expanded grid */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="expanded-grid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-5 gap-3 pt-3">
                  {ALL_AVATARS.slice(VISIBLE_COUNT).map(avatar => (
                    <AvatarButton key={avatar} avatar={avatar} selected={selectedAvatar === avatar} onSelect={setSelectedAvatar} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          placeholder="Enter your school or institution..."
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
