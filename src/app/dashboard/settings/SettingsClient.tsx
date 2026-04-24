"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  BellOff,
  Mail,
  Bookmark,
  MessageSquare,
  Sliders,
  Save,
  ShieldCheck,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Building2,
  Check,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { Country, State } from "country-state-city";
import { BackButton } from "@/components/ui/back-button";
import { updateUserPrivacyAction, updateProfileAction } from "@/lib/actions";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

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
const AVATAR_VISIBLE = 5;

interface SettingsClientProps {
  email: string;
  initialFullName: string;
  initialBio: string;
  initialCompany: string;
  initialCountry: string;
  initialLocation: string;
  initialAvatarUrl: string;
  initialIsPublic: boolean;
  initialGithubUrl: string;
  initialLinkedinUrl: string;
  initialTwitterUrl: string;
  initialWebsiteUrl: string;
}

type Tab = "profile" | "security" | "notifications" | "preferences";

const NAV_ITEMS: {
  id: Tab;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Name, email and public info",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: "security",
    label: "Account Security",
    description: "Password and login settings",
    icon: <Lock className="w-4 h-4" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and email preferences",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Privacy and display options",
    icon: <Sliders className="w-4 h-4" />,
  },
];

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18 },
  },
};

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 outline-none transition-all text-sm";

const selectCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 outline-none transition-all text-sm appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const primaryBtn =
  "flex items-center justify-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-500/20 active:scale-95 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed";

/* ── Toggle row sub-component ── */
function NotifRow({
  icon,
  iconColor,
  title,
  description,
  checked,
  onChange,
  disabled = false,
  isMaster = false,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  isMaster?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 transition-opacity ${
        disabled ? "opacity-40 pointer-events-none" : ""
      } ${isMaster ? "bg-slate-50" : "bg-white"}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${iconColor}`}>{icon}</span>
        <div>
          <p className={`text-sm font-medium ${isMaster ? "text-slate-800" : "text-slate-700"}`}>{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
        style={{ background: checked ? (isMaster ? "#ef4444" : "#7C3AFF") : "rgb(203,213,225)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

export default function SettingsClient({
  email,
  initialFullName,
  initialBio,
  initialCompany,
  initialCountry,
  initialLocation,
  initialAvatarUrl,
  initialIsPublic,
  initialGithubUrl,
  initialLinkedinUrl,
  initialTwitterUrl,
  initialWebsiteUrl,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile fields
  const [fullName, setFullName] = useState(initialFullName);
  const [bio, setBio] = useState(initialBio);
  const [company, setCompany] = useState(initialCompany);
  const [countryIso, setCountryIso] = useState(() => {
    if (!initialCountry) return "";
    return Country.getAllCountries().find((c) => c.name === initialCountry)?.isoCode || "";
  });
  const [selectedCity, setSelectedCity] = useState(initialLocation);
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatarUrl || ALL_AVATARS[0]);
  const [avatarExpanded, setAvatarExpanded] = useState(false);
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(initialLinkedinUrl);
  const [twitterUrl, setTwitterUrl] = useState(initialTwitterUrl);
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Preferences
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notifications
  const [muteAll, setMuteAll] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(true);
  const [projectInvites, setProjectInvites] = useState(true);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setIsProfileSaving(true);
    try {
      const formData = new FormData();
      formData.set("full_name", fullName);
      formData.set("bio", bio);
      formData.set("company", company);
      formData.set("country", Country.getCountryByCode(countryIso)?.name || "");
      formData.set("location", selectedCity);
      formData.set("avatar_url", selectedAvatar);
      formData.set("github_url", githubUrl);
      formData.set("linkedin_url", linkedinUrl);
      formData.set("twitter_url", twitterUrl);
      formData.set("website_url", websiteUrl);
      const result = await updateProfileAction(formData);
      if ("error" in result) {
        toast.error(result.error || "Failed to save profile.");
      } else {
        toast.success("Profile saved successfully.");
      }
    } finally {
      setIsProfileSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }
    setPwLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Şifreniz başarıyla güncellendi.");
        setNewPassword("");
        setConfirmPassword("");
        setShowNew(false);
        setShowConfirm(false);
      }
    } finally {
      setPwLoading(false);
    }
  }

  async function handlePrivacyChange(value: boolean) {
    setPrivacyLoading(true);
    const prev = isPublic;
    setIsPublic(value);
    const res = await updateUserPrivacyAction(value);
    setPrivacyLoading(false);
    if (!res.success) {
      setIsPublic(prev);
      toast.error("Failed to update privacy setting.");
    } else {
      toast.success(value ? "Profile set to Public." : "Profile set to Private.", {
        style: {
          borderRadius: "12px",
          background: "#0f1428",
          color: "#e2e8f0",
          border: "1px solid rgba(124,58,255,0.4)",
          fontSize: "13px",
          fontWeight: "bold",
        },
      });
    }
  }

  const activeItem = NAV_ITEMS.find((n) => n.id === activeTab)!;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4 mb-8"
      >
        <BackButton href="/dashboard" variant="light" />
        <div className="p-3 rounded-2xl bg-violet-100 text-[#7C3AFF] shadow shadow-violet-200/40">
          <SettingsIcon className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account and preferences.</p>
        </div>
      </motion.div>

      {/* Shell: sidebar + content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[520px]">

          {/* ── Sidebar (desktop) / Tab bar (mobile) ── */}
          <nav className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-100">
            {/* Mobile: horizontal scrollable row */}
            <div className="flex md:hidden overflow-x-auto gap-1 p-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? "bg-violet-50 text-violet-600"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical list */}
            <div className="hidden md:flex flex-col gap-1 p-3 pt-5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-violet-50 text-violet-600"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{item.icon}</span>
                  <span>
                    <span className={`block text-sm font-medium ${activeTab === item.id ? "text-violet-700" : "text-slate-700"}`}>
                      {item.label}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5 leading-tight">
                      {item.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* ── Content area ── */}
          <div className="flex-1 p-6 md:p-8 overflow-hidden">
            {/* Section heading */}
            <div className="mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#7C3AFF] mb-1">
                {activeItem.icon}
                <h2 className="text-base font-semibold text-slate-900">{activeItem.label}</h2>
              </div>
              <p className="text-sm text-slate-500">{activeItem.description}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={fadeIn}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {/* ── PROFILE ── */}
                {activeTab === "profile" && (
                  <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">

                    {/* Avatar selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-violet-500" /> Avatar
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          {ALL_AVATARS.slice(0, AVATAR_VISIBLE).map((av) => (
                            <button
                              key={av}
                              type="button"
                              onClick={() => setSelectedAvatar(av)}
                              className="relative w-11 h-11 rounded-full shrink-0 hover:scale-110 transition-transform focus-visible:outline-none"
                              style={selectedAvatar === av ? { boxShadow: "0 0 0 3px #7C3AFF" } : {}}
                            >
                              <img src={av} alt="avatar" className="w-full h-full rounded-full object-cover bg-white" />
                              {selectedAvatar === av && (
                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#7C3AFF]/30">
                                  <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />
                                </span>
                              )}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setAvatarExpanded((v) => !v)}
                            className="w-11 h-11 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-violet-400 hover:text-violet-500 transition-all shrink-0"
                          >
                            <motion.span animate={{ rotate: avatarExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                              <ChevronDown className="w-4 h-4" />
                            </motion.span>
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {avatarExpanded && (
                            <motion.div
                              key="avatar-grid"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-5 gap-3 pt-3">
                                {ALL_AVATARS.slice(AVATAR_VISIBLE).map((av) => (
                                  <button
                                    key={av}
                                    type="button"
                                    onClick={() => setSelectedAvatar(av)}
                                    className="relative w-11 h-11 rounded-full shrink-0 hover:scale-110 transition-transform focus-visible:outline-none"
                                    style={selectedAvatar === av ? { boxShadow: "0 0 0 3px #7C3AFF" } : {}}
                                  >
                                    <img src={av} alt="avatar" className="w-full h-full rounded-full object-cover bg-white" />
                                    {selectedAvatar === av && (
                                      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#7C3AFF]/30">
                                        <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="s-fullname" className="text-sm font-medium text-slate-600">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="s-fullname"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    </div>

                    {/* Email — read-only */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="email"
                          readOnly
                          value={email}
                          className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed text-sm select-none"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <label htmlFor="s-bio" className="text-sm font-medium text-slate-600">Bio</label>
                      <textarea
                        id="s-bio"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world a little about yourself..."
                        className={`${inputCls} resize-none`}
                      />
                    </div>

                    {/* Company */}
                    <div className="space-y-1.5">
                      <label htmlFor="s-company" className="text-sm font-medium text-slate-600">Company</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="s-company"
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Your company or org"
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    </div>

                    {/* Location — Country + City dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="s-country" className="text-sm font-medium text-slate-600">Country</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <select
                            id="s-country"
                            value={countryIso}
                            onChange={(e) => { setCountryIso(e.target.value); setSelectedCity(""); }}
                            className={`${selectCls} pl-9`}
                          >
                            <option value="">Select country...</option>
                            {Country.getAllCountries().map((c) => (
                              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="s-city" className="text-sm font-medium text-slate-600">City / Province</label>
                        <select
                          id="s-city"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          disabled={!countryIso}
                          className={selectCls}
                        >
                          <option value="">{countryIso ? "Select province..." : "Select a country first"}</option>
                          {(State.getStatesOfCountry(countryIso) || []).map((state) => (
                            <option key={state.isoCode} value={state.name}>{state.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="space-y-3 pt-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Social Accounts</p>
                      {([
                        { icon: <Github className="w-4 h-4" />, label: "GitHub", placeholder: "https://github.com/username", value: githubUrl, set: setGithubUrl },
                        { icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn", placeholder: "https://linkedin.com/in/username", value: linkedinUrl, set: setLinkedinUrl },
                        { icon: <Twitter className="w-4 h-4" />, label: "X / Twitter", placeholder: "https://x.com/username", value: twitterUrl, set: setTwitterUrl },
                        { icon: <Globe className="w-4 h-4" />, label: "Website", placeholder: "https://yourwebsite.com", value: websiteUrl, set: setWebsiteUrl },
                      ]).map(({ icon, label, placeholder, value, set }) => (
                        <div key={label} className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-600">{label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
                            <input
                              type="url"
                              value={value}
                              onChange={(e) => set(e.target.value)}
                              placeholder={placeholder}
                              className={`${inputCls} pl-9`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Save button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isProfileSaving}
                        className={primaryBtn}
                        style={{ background: "linear-gradient(135deg, #7C3AFF 0%, #9333ea 100%)" }}
                      >
                        {isProfileSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" strokeWidth={1.5} />
                        )}
                        {isProfileSaving ? "Saving..." : "Save Profile Changes"}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── SECURITY ── */}
                {activeTab === "security" && (
                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                    <div className="space-y-1.5">
                      <label htmlFor="newPassword" className="text-sm font-medium text-slate-600">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          className={`${inputCls} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                          aria-label={showNew ? "Hide password" : "Show password"}
                        >
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-600">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat the password"
                          required
                          minLength={6}
                          className={`${inputCls} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={pwLoading}
                        className={primaryBtn}
                        style={{ background: "linear-gradient(135deg, #7C3AFF 0%, #9333ea 100%)" }}
                      >
                        {pwLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                        )}
                        {pwLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                  <div className="max-w-lg space-y-6">
                    {/* Section intro */}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Notification Preferences</p>
                      <p className="text-xs text-slate-400 mt-0.5">Manage how you receive alerts and updates.</p>
                    </div>

                    {/* Notification rows */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">

                      {/* Master mute */}
                      <NotifRow
                        icon={<BellOff className="w-4 h-4" />}
                        iconColor="text-rose-500"
                        title="Mute All Notifications"
                        description="Silence every alert across the platform."
                        checked={muteAll}
                        onChange={setMuteAll}
                        isMaster
                      />

                      {/* Sub-toggles — dimmed when muteAll is on */}
                      <NotifRow
                        icon={<Mail className="w-4 h-4" />}
                        iconColor="text-violet-500"
                        title="Email Notifications"
                        description="Receive email updates when you're away from the platform."
                        checked={emailNotifications}
                        onChange={setEmailNotifications}
                        disabled={muteAll}
                      />

                      <NotifRow
                        icon={<Bookmark className="w-4 h-4" />}
                        iconColor="text-violet-500"
                        title="Watchlist Updates"
                        description="Get notified when a saved project has new activity."
                        checked={watchlistAlerts}
                        onChange={setWatchlistAlerts}
                        disabled={muteAll}
                      />

                      <NotifRow
                        icon={<MessageSquare className="w-4 h-4" />}
                        iconColor="text-violet-500"
                        title="Project Invitations & Messages"
                        description="Alerts for new collaboration invites and direct messages."
                        checked={projectInvites}
                        onChange={setProjectInvites}
                        disabled={muteAll}
                      />
                    </div>
                  </div>
                )}

                {/* ── PREFERENCES ── */}
                {activeTab === "preferences" && (
                  <div className="space-y-6 max-w-md">
                    {/* Privacy toggle */}
                    <div className="flex items-center justify-between gap-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#7C3AFF] mt-0.5 shrink-0" strokeWidth={1.5} />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Public Profile</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {isPublic
                              ? "Anyone with your link can view your profile and active projects."
                              : "Only you can see your profile. Others will see a private profile message."}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPublic}
                        disabled={privacyLoading}
                        onClick={() => handlePrivacyChange(!isPublic)}
                        className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 disabled:opacity-50"
                        style={{ background: isPublic ? "#7C3AFF" : "rgb(203,213,225)" }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                          style={{ transform: isPublic ? "translateX(20px)" : "translateX(0)" }}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
