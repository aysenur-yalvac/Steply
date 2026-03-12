'use client';

import { useState } from 'react';
import { updateProfile } from './actions';
import toast from 'react-hot-toast';
import { Save, Mail, User } from 'lucide-react';

export default function ProfileForm({ 
  initialFullName, 
  email,
  userId
}: { 
  initialFullName: string;
  email: string;
  userId: string;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    formData.append('id', userId);
    
    const result = await updateProfile(formData);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Profile updated successfully!');
    }
    
    setIsPending(false);
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      
      {/* Email Read-only Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
           <Mail className="w-4 h-4" /> Registered Email
        </label>
        <input 
          type="email" 
          value={email}
          disabled
          className="px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 focus:outline-none cursor-not-allowed"
        />
        <span className="text-xs text-slate-600">Email address cannot be changed for security reasons.</span>
      </div>

      {/* Full Name Updatable Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
           <User className="w-4 h-4" /> Full Name
        </label>
        <input 
          type="text" 
          name="full_name"
          defaultValue={initialFullName}
          placeholder="Your Name and Surname"
          required
          minLength={2}
          className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full lg:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </button>
      </div>
      
    </form>
  );
}
