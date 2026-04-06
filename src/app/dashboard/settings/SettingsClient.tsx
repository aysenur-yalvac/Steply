"use client";

import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { User, Settings as SettingsIcon, Save, Lock, ShieldCheck } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

interface SettingsClientProps {
  email: string;
  fullName: string;
  updateProfile: (formData: FormData) => Promise<void>;
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function SettingsClient({ email, fullName, updateProfile }: SettingsClientProps) {
  const [isPublic, setIsPublic] = useState(true);

  async function handlePrivacyChange(value: boolean) {
    setIsPublic(value);
    // TODO: wire up to updateUserPrivacyAction(value)
  }

  return (
    <div className="relative flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 overflow-hidden">

      {/* Blobs are provided by DashboardBackground in layout */}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4 mb-10 relative z-10"
      >
        <BackButton href="/dashboard" variant="light" />
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

        {/* Privacy card */}
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
            <ShieldCheck className="w-5 h-5 text-[#7C3AFF]" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-slate-900">Profile Privacy</h2>
          </div>

          <div className="flex items-center justify-between gap-6 max-w-md">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Public Profile</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isPublic
                  ? "Anyone with your link can view your profile and active projects."
                  : "Only you can see your profile and projects. Others will see a private profile message."}
              </p>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => handlePrivacyChange(!isPublic)}
              className="relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AFF]/40"
              style={{ background: isPublic ? "#7C3AFF" : "rgba(203,213,225,1)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                style={{ transform: isPublic ? "translateX(24px)" : "translateX(0)" }}
              />
            </button>
          </div>
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
