"use client";

import { motion } from "framer-motion";
import { User, Settings as SettingsIcon, Save, Lock } from "lucide-react";

interface SettingsClientProps {
  email: string;
  fullName: string;
  updateProfile: (formData: FormData) => Promise<void>;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function SettingsClient({ email, fullName, updateProfile }: SettingsClientProps) {
  return (
    <div className="relative flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 overflow-hidden">

      {/* Animated purple gradient blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle at 40% 40%, #7C3AFF 0%, #a855f7 45%, transparent 70%)",
          animation: "blobSpin 18s linear infinite",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle at 60% 60%, #6d28d9 0%, #c026d3 50%, transparent 70%)",
          animation: "blobSpin 24s linear infinite reverse",
        }}
      />

      <style>{`
        @keyframes blobSpin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.08); }
          to   { transform: rotate(360deg) scale(1); }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 mb-10 relative z-10"
      >
        <div className="p-3 rounded-2xl bg-[#7C3AFF]/10 text-[#7C3AFF] shadow-lg shadow-violet-200/40">
          <SettingsIcon className="w-7 h-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your profile and account preferences.</p>
        </div>
      </motion.div>

      {/* Staggered cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-6 relative z-10"
      >
        {/* Profile card */}
        <motion.section
          variants={fadeUp}
          className="rounded-3xl p-8 shadow-xl shadow-violet-100/30"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.40)",
            border: "1px solid rgba(255,255,255,0.55)",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-[#7C3AFF]" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
          </div>

          <form action={updateProfile} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-600">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200/70 text-slate-400 cursor-not-allowed text-sm backdrop-blur-sm"
              />
              <p className="text-xs text-slate-400">Email address cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-600">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={fullName}
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200/70 text-slate-800 focus:ring-2 focus:ring-[#7C3AFF]/30 focus:border-[#7C3AFF]/50 outline-none transition-all text-sm backdrop-blur-sm"
                placeholder="Your Name and Surname"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 active:scale-95 hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #7C3AFF 0%, #9333ea 100%)" }}
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                Save Changes
              </button>
            </div>
          </form>
        </motion.section>

        {/* Security card */}
        <motion.section
          variants={fadeUp}
          className="rounded-3xl p-8 shadow-xl shadow-violet-100/30"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.40)",
            border: "1px solid rgba(255,255,255,0.55)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-[#7C3AFF]" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-slate-900">Account Security</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Currently, password reset is handled manually via email.
          </p>
          <button
            disabled
            className="px-6 py-3 bg-white/50 border border-slate-200/60 text-slate-400 font-semibold rounded-xl cursor-not-allowed text-sm backdrop-blur-sm"
          >
            Change Password (Soon)
          </button>
        </motion.section>
      </motion.div>
    </div>
  );
}
