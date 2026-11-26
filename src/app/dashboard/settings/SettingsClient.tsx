"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Sliders,
  Save,
  ShieldCheck,
  ShieldOff,
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
  IdCard,
  Phone,
  Upload,
  Camera,
  AlertTriangle,
  Trash2,
  X,
  Clock,
  CheckSquare,
  UserPlus,
} from "lucide-react";
import { Country, State } from "country-state-city";
import { BackButton } from "@/components/ui/back-button";
import {
  updateUserPrivacyAction,
  updateProfileAction,
  unblockUserAction,
  updateNotificationPreferencesAction,
} from "@/lib/actions";
import type { FollowUser } from "@/lib/actions";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/notifications";
import { Avatar } from "@/components/ui/avatar";
import UniversityCombobox from "@/components/ui/UniversityCombobox";
import DepartmentCombobox from "@/components/ui/DepartmentCombobox";
import { createClient } from "@/utils/supabase/client";
import { clearAllSavedLocalAccounts } from "@/context/AuthProvider";
import toast from "react-hot-toast";
import { isStudentEmail, STUDENT_EMAIL_ERROR_MESSAGE } from "@/lib/email-validation";

const ALL_AVATARS = Array.from({ length: 20 }, (_, i) => `/avatars/avatar-${i + 1}.svg`);
const AVATAR_VISIBLE = 5;

const GRADE_OPTIONS = ['Hazırlık', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Mezun'];

interface SettingsClientProps {
  userId: string;
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
  initialUniversity: string;
  initialDepartment?: string;
  initialRole: string;
  initialGrade: string;
  initialSchoolNumber: string;
  initialSchoolEmail: string;
  initialPhoneNumber: string;
  initialBlockedUsers?: FollowUser[];
  initialNotificationPreferences?: NotificationPreferences;
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
    label: "Profil Bilgileri",
    description: "Ad soyad, e-posta ve genel bilgiler",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: "security",
    label: "Hesap Güvenliği",
    description: "Şifre ve oturum ayarları",
    icon: <Lock className="w-4 h-4" />,
  },
  {
    id: "notifications",
    label: "Bildirim Tercihleri",
    description: "Uyarılar ve e-posta tercihleri",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: "preferences",
    label: "Görünüm ve Gizlilik",
    description: "Gizlilik ve görüntüleme seçenekleri",
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
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 dark:text-slate-200 dark:text-slate-100 focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 outline-none transition-all text-sm";

const selectCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 dark:text-slate-200 dark:text-slate-100 focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 outline-none transition-all text-sm appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const primaryBtn =
  "w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-500/20 active:scale-95 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed";

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
      } ${isMaster ? "bg-slate-50 dark:bg-slate-950" : "bg-white dark:bg-slate-900"}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${iconColor}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{description}</p>
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
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

export default function SettingsClient({
  userId,
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
  initialUniversity,
  initialDepartment = "",
  initialRole,
  initialGrade,
  initialSchoolNumber,
  initialSchoolEmail,
  initialPhoneNumber,
  initialBlockedUsers = [],
  initialNotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [blockedUsers, setBlockedUsers] = useState<FollowUser[]>(initialBlockedUsers);
  const [unblocking, setUnblocking] = useState<string | null>(null);

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
  const [university, setUniversity]       = useState(initialUniversity);
  const [isUniversityLocked, setIsUniversityLocked] = useState(() => Boolean(initialUniversity && initialUniversity.trim()));
  const [department, setDepartment]       = useState(initialDepartment);
  const [isDepartmentLocked, setIsDepartmentLocked] = useState(() => Boolean(initialDepartment && initialDepartment.trim()));
  const [role, setRole]                   = useState(initialRole || 'student');
  const [grade, setGrade]                 = useState(initialGrade || '');
  const [schoolNumber, setSchoolNumber]   = useState(initialSchoolNumber || '');
  const [schoolEmail, setSchoolEmail]     = useState(initialSchoolEmail || '');
  const [schoolEmailError, setSchoolEmailError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber]     = useState(() => {
    const raw = (initialPhoneNumber || '').trim();
    if (!raw) return '';
    return raw.replace(/^(?:\+90|90|0)\s*/, '');
  });
  const [linkedinUrl, setLinkedinUrl]     = useState(initialLinkedinUrl);
  const [pendingFile, setPendingFile]     = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]       = useState<string | null>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);
  const [twitterUrl, setTwitterUrl] = useState(initialTwitterUrl);
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Preferences
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // Security
  const PW_RESET_COOLDOWN_KEY = "steply_pw_reset_cooldown_until";
  const DELETE_OTP_COOLDOWN_KEY = "steply_delete_otp_cooldown_until";

  const getRemainingSeconds = (storageKey: string): number => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return 0;
      const until = Number(raw);
      if (!Number.isFinite(until) || until <= Date.now()) {
        window.localStorage.removeItem(storageKey);
        return 0;
      }
      return Math.ceil((until - Date.now()) / 1000);
    } catch {
      return 0;
    }
  };

  const startPersistentCooldown = (
    storageKey: string,
    setter: React.Dispatch<React.SetStateAction<number>>,
    seconds = 60
  ) => {
    const until = Date.now() + seconds * 1000;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, String(until));
      } catch {}
    }
    setter(seconds);
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [resetSending, setResetSending] = useState(false);
  const [resetSentMsg, setResetSentMsg] = useState<string | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);

  useEffect(() => {
    const syncReset = () => setResetCooldown(getRemainingSeconds(PW_RESET_COOLDOWN_KEY));
    syncReset();
    const timer = setInterval(syncReset, 1000);
    return () => clearInterval(timer);
  }, []);

  // Permanent Account Deletion (Danger Zone under Account Security)
  const [securitySubTab, setSecuritySubTab] = useState<"password" | "delete">("password");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [deleteOtpCode, setDeleteOtpCode] = useState("");
  const [deleteOtpSending, setDeleteOtpSending] = useState(false);
  const [deleteOtpCooldown, setDeleteOtpCooldown] = useState(0);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  const [deleteModalInfo, setDeleteModalInfo] = useState<string | null>(null);

  useEffect(() => {
    const syncDeleteOtp = () => {
      const rem = getRemainingSeconds(DELETE_OTP_COOLDOWN_KEY);
      setDeleteOtpCooldown(rem);
      if (rem > 0) setDeleteOtpSent(true);
    };
    syncDeleteOtp();
    const timer = setInterval(syncDeleteOtp, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleSendDeleteAccountOtp() {
    if (deleteOtpSending || deleteOtpCooldown > 0) return;
    setDeleteOtpSending(true);
    setDeleteModalError(null);
    setDeleteModalInfo(null);
    try {
      const res = await fetch("/api/auth/delete-account/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Doğrulama kodu gönderilemedi.";
        setDeleteModalError(msg);
        toast.error(msg);
        return;
      }
      setDeleteOtpSent(true);
      startPersistentCooldown(DELETE_OTP_COOLDOWN_KEY, setDeleteOtpCooldown, 60);
      const infoMsg = `${email} adresine 6 haneli doğrulama kodu gönderildi (10 dakika geçerli).`;
      setDeleteModalInfo(infoMsg);
      toast.success("Doğrulama kodu e-posta adresinize gönderildi.");
    } catch {
      const msg = "Ağ hatası nedeniyle doğrulama kodu gönderilemedi.";
      setDeleteModalError(msg);
      toast.error(msg);
    } finally {
      setDeleteOtpSending(false);
    }
  }

  async function handleConfirmDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (deleteConfirming) return;
    const cleanCode = deleteOtpCode.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      const msg = "Lütfen e-postanıza gönderilen 6 haneli doğrulama kodunu eksiksiz girin.";
      setDeleteModalError(msg);
      toast.error(msg);
      return;
    }

    setDeleteConfirming(true);
    setDeleteModalError(null);
    try {
      const res = await fetch("/api/auth/delete-account/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Hesap silinemedi. Lütfen kodu kontrol edip tekrar deneyin.";
        setDeleteModalError(msg);
        toast.error(msg);
        setDeleteConfirming(false);
        return;
      }

      clearAllSavedLocalAccounts();
      try {
        const supabaseClient = createClient();
        await Promise.race([
          supabaseClient.auth.signOut(),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      } catch {}

      toast.success("Hesabınız ve tüm verileriniz kalıcı olarak silindi.");
      window.location.href = "/";
    } catch {
      const msg = "Hesap silinirken bir ağ hatası oluştu. Lütfen tekrar deneyin.";
      setDeleteModalError(msg);
      toast.error(msg);
      setDeleteConfirming(false);
    }
  }

  // Notifications (7 independent preference toggles)
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(
    initialNotificationPreferences
  );
  const [isNotifSaving, setIsNotifSaving] = useState(false);

  function handleToggleNotifPref(key: keyof NotificationPreferences, val: boolean) {
    setNotifPrefs((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSaveNotificationPreferences() {
    setIsNotifSaving(true);
    try {
      const res = await updateNotificationPreferencesAction(notifPrefs);
      if (!res.success) {
        toast.error(res.error || "Bildirim tercihleri kaydedilemedi.");
      } else {
        if (res.preferences) setNotifPrefs(res.preferences);
        toast.success("Bildirim tercihleriniz kaydedildi!");
      }
    } catch {
      toast.error("Bildirim tercihleri kaydedilirken bir hata oluştu.");
    } finally {
      setIsNotifSaving(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setIsProfileSaving(true);
    try {
      if (!fullName.trim()) {
        toast.error("İsim Soyisim alanı zorunludur.");
        return;
      }
      if (role === 'student' && !grade) {
        toast.error("Öğrenci rolü için sınıf seçimi zorunludur.");
        return;
      }
      if (university && university.trim() && !department.trim()) {
        toast.error("Üniversite seçildiğinde bölüm seçimi zorunludur.");
        return;
      }
      setSchoolEmailError(null);
      if (role === 'student') {
        if (university && !schoolNumber.trim()) {
          toast.error("Okul numarası zorunludur.");
          return;
        }
        if ((university || schoolEmail.trim()) && !isStudentEmail(schoolEmail.trim())) {
          setSchoolEmailError(STUDENT_EMAIL_ERROR_MESSAGE);
          toast.error(STUDENT_EMAIL_ERROR_MESSAGE);
          return;
        }
      } else if (schoolEmail.trim() && !isStudentEmail(schoolEmail.trim())) {
        setSchoolEmailError(STUDENT_EMAIL_ERROR_MESSAGE);
        toast.error(STUDENT_EMAIL_ERROR_MESSAGE);
        return;
      }

      let avatarUrl = selectedAvatar;

      // Upload photo to Supabase Storage if a new file was selected
      if (pendingFile) {
        const ext = pendingFile.name.split('.').pop() ?? 'jpg';
        const path = `avatars/${userId}/${Date.now()}.${ext}`;
        const supabaseClient = createClient();
        // No dedicated 'avatars' bucket exists — reuse the 'project-files' bucket
        // (already public + has authenticated read/write storage policies).
        const { error: uploadError } = await supabaseClient.storage
          .from('project-files')
          .upload(path, pendingFile, { upsert: true, contentType: pendingFile.type });
        if (uploadError) {
          toast.error(`Fotoğraf yüklenemedi: ${uploadError.message}`);
          return;
        }
        const { data: urlData } = supabaseClient.storage.from('project-files').getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
        setSelectedAvatar(avatarUrl);
        setPendingFile(null);
        toast.success("Profil fotoğrafı güncellendi.");
      }

      const cleanedPhone = phoneNumber.trim().replace(/^(?:\+90|90|0)\s*/, '').trim();
      const formattedPhone = cleanedPhone ? `+90 ${cleanedPhone}` : '';

      const formData = new FormData();
      formData.set("full_name", fullName);
      formData.set("bio", bio);
      formData.set("company", company);
      formData.set("country", Country.getCountryByCode(countryIso)?.name || "");
      formData.set("location", selectedCity);
      formData.set("avatar_url", avatarUrl);
      formData.set("github_url", githubUrl);
      formData.set("linkedin_url", linkedinUrl);
      formData.set("twitter_url", twitterUrl);
      formData.set("website_url", websiteUrl);
      formData.set("university", university);
      formData.set("institution", university);
      formData.set("department", department.trim());
      formData.set("role", role);
      formData.set("grade", role === 'student' ? grade : '');
      formData.set("school_number", role === 'student' ? schoolNumber : '');
      formData.set("school_email", schoolEmail);
      formData.set("phone_number", formattedPhone);
      const result = await updateProfileAction(formData);
      if ("error" in result) {
        toast.error(result.error || "Profil kaydedilemedi.");
      } else {
        if (university && university.trim()) {
          setIsUniversityLocked(true);
        }
        if (department && department.trim()) {
          setIsDepartmentLocked(true);
        }
        toast.success("Profil başarıyla kaydedildi.");
      }
    } finally {
      setIsProfileSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);

    if (!currentPassword.trim()) {
      const msg = "Lütfen mevcut şifrenizi girin.";
      setPwError(msg);
      toast.error(msg);
      return;
    }
    if (newPassword.length < 6) {
      const msg = "Yeni şifre en az 6 karakter olmalıdır.";
      setPwError(msg);
      toast.error(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "Şifreler eşleşmiyor.";
      setPwError(msg);
      toast.error(msg);
      return;
    }
    setPwLoading(true);
    try {
      const supabase = createClient();

      // 1. Mevcut şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        const msg = "Mevcut şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.";
        setPwError(msg);
        toast.error(msg);
        return;
      }

      // 2. Yeni şifreyi güncelle
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwError(error.message);
        toast.error(error.message);
      } else {
        toast.success("Şifreniz başarıyla güncellendi.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        setResetSentMsg(null);
      }
    } finally {
      setPwLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Kayıtlı e-posta adresi bulunamadı.");
      return;
    }
    if (resetCooldown > 0 || resetSending) return;
    setResetSending(true);
    setPwError(null);
    setResetSentMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.error || "Şifre sıfırlama bağlantısı gönderilemedi.";
        setPwError(msg);
        toast.error(msg);
        if (res.status === 429) {
          startPersistentCooldown(PW_RESET_COOLDOWN_KEY, setResetCooldown, 60);
        }
        return;
      }

      const msg =
        data?.message ||
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.";
      setResetSentMsg(msg);
      startPersistentCooldown(PW_RESET_COOLDOWN_KEY, setResetCooldown, 60);
      toast.success(msg);
    } catch {
      const msg = "Ağ hatası nedeniyle şifre sıfırlama bağlantısı gönderilemedi.";
      setPwError(msg);
      toast.error(msg);
    } finally {
      setResetSending(false);
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
      toast.error("Gizlilik ayarı güncellenemedi.");
    } else {
      toast.success(value ? "Profil herkese açık yapıldı." : "Profil gizli yapıldı.", {
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Ayarlar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Hesabınızı ve tercihlerinizi yönetin.</p>
        </div>
      </motion.div>

      {/* Shell: sidebar + content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[520px]">

          {/* ── Sidebar (desktop) / Tab bar (mobile) ── */}
          <nav className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-100">
            {/* Mobile: horizontal scrollable row */}
            <div className="flex md:hidden overflow-x-auto gap-1.5 p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 min-h-[44px] py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === item.id
                      ? "bg-violet-50 text-violet-600 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:bg-slate-950"
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
                      ? "bg-violet-50 text-violet-600 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:bg-slate-950"
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
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">{activeItem.label}</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{activeItem.description}</p>
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

                    {/* Profile photo upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-violet-500" /> Profil Fotoğrafı
                      </label>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                        {/* Photo preview + click-to-upload */}
                        <div className="flex items-center gap-5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 group border-2 border-slate-200 dark:border-slate-800 hover:border-violet-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                          >
                            <img
                              src={previewUrl ?? selectedAvatar}
                              alt="Profil fotoğrafı"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                              <Camera className="w-5 h-5 text-white" />
                              <span className="text-[10px] text-white font-semibold">Değiştir</span>
                            </span>
                          </button>

                          <div className="flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {pendingFile ? 'Farklı fotoğraf seç' : 'Fotoğraf yükle'}
                            </button>
                            {pendingFile ? (
                              <p className="text-[11px] text-emerald-600 font-medium mt-1.5 truncate">
                                ✓ {pendingFile.name} seçildi — kaydet butonuna bas
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 mt-1.5">
                                Son 6 ayda çekilmiş net yüz fotoğrafı · JPG, PNG, WEBP
                              </p>
                            )}
                          </div>
                        </div>

                        <input ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden dark:bg-slate-800 dark:text-white dark:border-slate-700"
                          onChange={handleFileChange}
                        />

                        {/* DiceBear avatar fallback */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <p className="text-[11px] text-slate-400 mb-2 font-medium">veya illüstrasyon seç:</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {ALL_AVATARS.slice(0, AVATAR_VISIBLE).map((av) => (
                              <button
                                key={av}
                                type="button"
                                onClick={() => { setSelectedAvatar(av); setPendingFile(null); setPreviewUrl(null); }}
                                className="relative w-9 h-9 rounded-full shrink-0 hover:scale-110 transition-transform focus-visible:outline-none"
                                style={selectedAvatar === av && !pendingFile ? { boxShadow: "0 0 0 2.5px #7C3AFF" } : {}}
                              >
                                <img src={av} alt="avatar" className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900" />
                                {selectedAvatar === av && !pendingFile && (
                                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#7C3AFF]/30">
                                    <Check className="w-3 h-3 text-white drop-shadow" strokeWidth={3} />
                                  </span>
                                )}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setAvatarExpanded((v) => !v)}
                              className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-all shrink-0"
                            >
                              <motion.span animate={{ rotate: avatarExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                <ChevronDown className="w-3.5 h-3.5" />
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
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-6 gap-2 pt-3">
                                  {ALL_AVATARS.slice(AVATAR_VISIBLE).map((av) => (
                                    <button
                                      key={av}
                                      type="button"
                                      onClick={() => { setSelectedAvatar(av); setPendingFile(null); setPreviewUrl(null); }}
                                      className="relative w-9 h-9 rounded-full shrink-0 hover:scale-110 transition-transform focus-visible:outline-none"
                                      style={selectedAvatar === av && !pendingFile ? { boxShadow: "0 0 0 2.5px #7C3AFF" } : {}}
                                    >
                                      <img src={av} alt="avatar" className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900" />
                                      {selectedAvatar === av && !pendingFile && (
                                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#7C3AFF]/30">
                                          <Check className="w-3 h-3 text-white drop-shadow" strokeWidth={3} />
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
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="s-fullname" className="text-sm font-medium text-slate-600 dark:text-slate-300">Ad Soyad</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="s-fullname"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Adınız ve soyadınız"
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    </div>

                    {/* Email — read-only */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">E-posta Adresi</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="email"
                          readOnly
                          value={email}
                          className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed text-sm select-none dark:bg-slate-800 dark:text-white dark:border-slate-700"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <label htmlFor="s-bio" className="text-sm font-medium text-slate-600 dark:text-slate-300">Biyografi</label>
                      <textarea
                        id="s-bio"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Kendinizden kısaca bahsedin..."
                        className={`${inputCls} resize-none`}
                      />
                    </div>

                    {/* Company */}
                    <div className="space-y-1.5">
                      <label htmlFor="s-company" className="text-sm font-medium text-slate-600 dark:text-slate-300">Şirket / Kurum</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="s-company"
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Şirketiniz veya kurumunuz"
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Rolünüz
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-80 cursor-not-allowed">
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                        </span>
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-auto" />
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Rol değiştirilemez. Destek için yöneticinize başvurun.</p>
                    </div>

                    {/* Grade — shown only for students */}
                    {role === 'student' && (
                      <div className="space-y-1.5">
                        <label htmlFor="s-grade" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Sınıfınız <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <select
                            id="s-grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            required
                            className={selectCls}
                          >
                            <option value="">Sınıf seçin...</option>
                            {GRADE_OPTIONS.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-[11px] text-slate-400">Öğrenci hesapları için zorunludur.</p>
                      </div>
                    )}

                    {/* Okul Bilgileri — kayıtlı okul bilgisi kilitli (readOnly) + okul numarası ve öğrenci e-postası */}
                    <div className="space-y-3 pt-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                        <IdCard className="w-3.5 h-3.5" /> Okul Bilgileri
                        {role === 'student' && (
                          <span className="text-rose-400 font-normal normal-case tracking-normal ml-1">— Zorunlu</span>
                        )}
                      </p>

                      {/* Okul / Üniversite — eğer daha önceden kayıtlıysa kilitli (readOnly / disabled), boşsa tek seferlik seçime açık */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          {isUniversityLocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-violet-500" />
                          )}
                          Okul / Üniversite
                        </label>
                        {isUniversityLocked ? (
                          <>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input
                                type="text"
                                readOnly
                                disabled
                                value={university}
                                className="w-full pl-9 pr-9 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed text-sm select-none dark:bg-slate-800 dark:text-white dark:border-slate-700"
                              />
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              Okul bilgisi kaydedilmiştir ve sonradan değiştirilemez.
                            </p>
                          </>
                        ) : (
                          <>
                            <UniversityCombobox
                              value={university}
                              onChange={setUniversity}
                              placeholder="Okul veya üniversite ara / seç..."
                            />
                            <p className="text-[11px] text-amber-600 dark:text-amber-400">
                              Kayıt sırasında okul seçmediğiniz için tek seferlik okul seçimi yapabilirsiniz. Kaydedildikten sonra kilitlenecektir.
                            </p>
                          </>
                        )}
                      </div>

                      {/* Bölüm (Department) — Üniversite seçildiğinde zorunlu, kaydedildikten sonra kalıcı olarak kilitli */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          {isDepartmentLocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          ) : null}
                          <span>Bölüm</span>
                          {university && !isDepartmentLocked ? (
                            <span className="text-rose-500">*</span>
                          ) : null}
                        </label>
                        {isDepartmentLocked ? (
                          <>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input
                                type="text"
                                readOnly
                                disabled
                                value={department}
                                className="w-full pl-9 pr-9 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed text-sm select-none dark:bg-slate-800 dark:text-white dark:border-slate-700"
                              />
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              Bölüm bilgisi kaydedilmiştir ve sonradan değiştirilemez.
                            </p>
                          </>
                        ) : (
                          <>
                            <DepartmentCombobox
                              value={department}
                              onChange={setDepartment}
                              placeholder="Bölüm ara ve seç... (Örn: Bilgisayar Mühendisliği)"
                            />
                            <p className="text-[11px] text-amber-600 dark:text-amber-400">
                              Okulum sayfasında bölüm arkadaşlarınızı ve hocalarınızı görebilmek için tek seferlik bölüm seçimi yapın. Kaydedildikten sonra kilitlenecektir.
                            </p>
                          </>
                        )}
                      </div>

                      {/* Okul Numarası — sadece öğrenciler için */}
                      {role === 'student' && (
                        <div className="space-y-1.5">
                          <label htmlFor="s-school-number" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Okul Numarası {university ? <span className="text-rose-500">*</span> : null}
                          </label>
                          <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              id="s-school-number"
                              type="text"
                              value={schoolNumber}
                              onChange={(e) => setSchoolNumber(e.target.value)}
                              placeholder="Örn: 20240001"
                              className={`${inputCls} pl-9`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Öğrenci E-postası — öğrenci uzantılı (@ogr. vb.) zorunlu */}
                      {role === 'student' && (
                        <div className="space-y-1.5">
                          <label htmlFor="s-school-email" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Öğrenci E-postası {university ? <span className="text-rose-500">*</span> : null}
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              id="s-school-email"
                              type="text"
                              inputMode="email"
                              value={schoolEmail}
                              onChange={(e) => {
                                setSchoolEmail(e.target.value);
                                if (schoolEmailError) setSchoolEmailError(null);
                              }}
                              placeholder="Örn: ad.soyad@ogr.universite.edu.tr"
                              className={`${inputCls} pl-9 ${schoolEmailError ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/25" : ""}`}
                            />
                          </div>
                          {schoolEmailError && (
                            <p className="text-xs font-semibold text-rose-500 mt-1">
                              {schoolEmailError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Phone — optional with fixed +90 prefix */}
                    <div className="space-y-1.5">
                      <label htmlFor="s-phone" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Telefon Numarası <span className="text-slate-400 font-normal text-xs">(isteğe bağlı)</span>
                      </label>
                      <div className="flex items-stretch gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 text-sm font-semibold shrink-0 select-none">
                          <span>🇹🇷 +90</span>
                        </div>
                        <div className="relative flex-1 min-w-0">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="s-phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/^(?:\+90|90|0)\s*/, '');
                              setPhoneNumber(val);
                            }}
                            placeholder="555 123 45 67"
                            className={`${inputCls} pl-9`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location — Country + City dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="s-country" className="text-sm font-medium text-slate-600 dark:text-slate-300">Ülke</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <select
                            id="s-country"
                            value={countryIso}
                            onChange={(e) => { setCountryIso(e.target.value); setSelectedCity(""); }}
                            className={`${selectCls} pl-9`}
                          >
                            <option value="">Ülke seçin...</option>
                            {Country.getAllCountries().map((c) => (
                              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="s-city" className="text-sm font-medium text-slate-600 dark:text-slate-300">Şehir / İl</label>
                        <select
                          id="s-city"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          disabled={!countryIso}
                          className={selectCls}
                        >
                          <option value="">{countryIso ? "Şehir seçin..." : "Önce bir ülke seçin"}</option>
                          {(State.getStatesOfCountry(countryIso) || []).map((state) => (
                            <option key={state.isoCode} value={state.name}>{state.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="space-y-3 pt-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sosyal Medya Hesapları</p>
                      {([
                        { icon: <Github className="w-4 h-4" />, label: "GitHub", placeholder: "https://github.com/kullaniciadi", value: githubUrl, set: setGithubUrl },
                        { icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn", placeholder: "https://linkedin.com/in/kullaniciadi", value: linkedinUrl, set: setLinkedinUrl },
                        { icon: <Twitter className="w-4 h-4" />, label: "X / Twitter", placeholder: "https://x.com/kullaniciadi", value: twitterUrl, set: setTwitterUrl },
                        { icon: <Globe className="w-4 h-4" />, label: "Web Sitesi", placeholder: "https://websiteniz.com", value: websiteUrl, set: setWebsiteUrl },
                      ]).map(({ icon, label, placeholder, value, set }) => (
                        <div key={label} className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
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
                        {isProfileSaving
                          ? (pendingFile ? "Fotoğraf yükleniyor..." : "Kaydediliyor...")
                          : "Profili Kaydet"}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── SECURITY ── */}
                {activeTab === "security" && (
                  <div className="space-y-6 max-w-xl">
                    {/* Sub-tabs: Şifre Değiştir | Hesabı Kapat */}
                    <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 max-w-md">
                      <button
                        type="button"
                        onClick={() => setSecuritySubTab("password")}
                        className={`flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          securitySubTab === "password"
                            ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-300 shadow-sm border border-slate-200/60 dark:border-slate-700"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <KeyRound className="w-4 h-4 shrink-0" />
                        <span className="truncate">Şifre Değiştir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSecuritySubTab("delete")}
                        className={`flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          securitySubTab === "delete"
                            ? "bg-rose-600 text-white shadow-sm shadow-rose-600/25 border border-rose-500"
                            : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        }`}
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                        <span className="truncate">Hesabı Kapat</span>
                      </button>
                    </div>

                    {securitySubTab === "password" && (
                      <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                        <div className="space-y-1.5">
                          <label htmlFor="currentPassword" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Mevcut Şifre
                          </label>
                          <div className="relative">
                            <input
                              id="currentPassword"
                              type={showCurrent ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                if (pwError) setPwError(null);
                              }}
                              placeholder="Mevcut şifrenizi girin"
                              required
                              className={`${inputCls} pr-11`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                              aria-label={showCurrent ? "Şifreyi gizle" : "Şifreyi göster"}
                            >
                              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="flex items-center justify-end pt-0.5">
                            <button
                              type="button"
                              onClick={handleForgotPassword}
                              disabled={resetSending || resetCooldown > 0}
                              className="inline-flex items-center gap-1.5 min-h-[36px] px-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                            >
                              {resetSending && <Loader2 className="w-3 h-3 animate-spin" />}
                              {resetSending
                                ? "Gönderiliyor..."
                                : resetCooldown > 0
                                  ? `Tekrar gönder (${resetCooldown}s)`
                                  : "Şifremi unuttum"}
                            </button>
                          </div>
                        </div>

                        {resetSentMsg && (
                          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 leading-relaxed">
                            {resetSentMsg}
                          </div>
                        )}

                        {pwError && (
                          <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                            {pwError}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label htmlFor="newPassword" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Yeni Şifre
                          </label>
                          <div className="relative">
                            <input
                              id="newPassword"
                              type={showNew ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="En az 6 karakter"
                              required
                              minLength={6}
                              className={`${inputCls} pr-11`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                              aria-label={showNew ? "Şifreyi gizle" : "Şifreyi göster"}
                            >
                              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Yeni Şifreyi Onayla
                          </label>
                          <div className="relative">
                            <input
                              id="confirmPassword"
                              type={showConfirm ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Şifrenizi tekrar girin"
                              required
                              minLength={6}
                              className={`${inputCls} pr-11`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                              aria-label={showConfirm ? "Şifreyi gizle" : "Şifreyi göster"}
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
                            {pwLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                          </button>
                        </div>
                      </form>
                    )}

                    {securitySubTab === "delete" && (
                      <div className="rounded-2xl border-2 border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-5 sm:p-6 shadow-sm space-y-5">
                        <div className="flex items-start gap-3.5">
                          <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shrink-0 mt-0.5">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <h3 className="text-base font-bold text-rose-700 dark:text-rose-300">
                              Hesabı Kalıcı Olarak Kapat
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              Hesabınızı kapattığınızda tüm profil bilgileriniz, oluşturduğunuz projeler, görevler ve ekip üyelikleriniz kalıcı olarak silinir. Bu işlem geri alınamaz; ancak silme işleminden sonra aynı e-posta adresiyle sıfırdan yeniden kayıt olabilirsiniz.
                            </p>
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteModalError(null);
                              setDeleteModalInfo(null);
                              setDeleteOtpCode("");
                              setShowDeleteModal(true);
                            }}
                            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hesabımı Kapatmak İstiyorum</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                  <div className="max-w-2xl space-y-6">
                    {/* Section intro */}
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Akıllı Bildirim Tercihleri
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Uygulama içi bildirim zili ve e-posta bildirimlerini her olay için bağımsız olarak tek tek yönetebilirsiniz.
                      </p>
                    </div>

                    {/* Group 1: Proje Davetleri */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 px-1">
                        1. Proje Davetleri
                      </p>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        <NotifRow
                          icon={<UserPlus className="w-4 h-4" />}
                          iconColor="text-violet-500"
                          title="Proje Davetleri — Uygulama İçi Bildirim Zili"
                          description="Bir projeye ekip üyesi olarak davet edildiğinizde sağ üst bildirim zilinde uyarı gösterilir."
                          checked={notifPrefs.in_app_invites}
                          onChange={(v) => handleToggleNotifPref("in_app_invites", v)}
                        />
                        <NotifRow
                          icon={<Mail className="w-4 h-4" />}
                          iconColor="text-indigo-500"
                          title="Proje Davetleri — E-Posta Bildirimi"
                          description="Yeni bir proje daveti aldığınızda kayıtlı e-posta adresinize davet bağlantısı gönderilir."
                          checked={notifPrefs.email_invites}
                          onChange={(v) => handleToggleNotifPref("email_invites", v)}
                        />
                      </div>
                    </div>

                    {/* Group 2: Görev Atama, Güncelleme & Son 24 Saat Hatırlatması */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 px-1">
                        2. Görevler ve Teslim Hatırlatıcıları
                      </p>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        <NotifRow
                          icon={<CheckSquare className="w-4 h-4" />}
                          iconColor="text-emerald-500"
                          title="Görev Atama & Güncellemeleri — Uygulama İçi Bildirim Zili"
                          description="Size yeni bir görev atandığında veya göreviniz güncellendiğinde bildirim zilinde görünür."
                          checked={notifPrefs.in_app_tasks}
                          onChange={(v) => handleToggleNotifPref("in_app_tasks", v)}
                        />
                        <NotifRow
                          icon={<Mail className="w-4 h-4" />}
                          iconColor="text-teal-500"
                          title="Görev Atama & Güncellemeleri — E-Posta Bildirimi"
                          description="Size görev atandığında veya görev durumu değiştiğinde e-posta ile bilgilendirilirsiniz."
                          checked={notifPrefs.email_tasks}
                          onChange={(v) => handleToggleNotifPref("email_tasks", v)}
                        />
                        <NotifRow
                          icon={<Clock className="w-4 h-4" />}
                          iconColor="text-amber-500"
                          title="Son 24 Saat Görev Teslim Hatırlatması — E-Posta Bildirimi"
                          description="Tamamlanmamış görevlerinizin teslim tarihine 24 saat veya daha az süre kaldığında otomatik hatırlatma e-postası gönderilir."
                          checked={notifPrefs.email_task_deadline}
                          onChange={(v) => handleToggleNotifPref("email_task_deadline", v)}
                        />
                      </div>
                    </div>

                    {/* Save Preferences Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSaveNotificationPreferences}
                        disabled={isNotifSaving}
                        className={primaryBtn}
                        style={{ background: "linear-gradient(135deg, #7C3AFF 0%, #9333ea 100%)" }}
                      >
                        {isNotifSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" strokeWidth={1.5} />
                        )}
                        {isNotifSaving ? "Kaydediliyor..." : "Tercihleri Kaydet"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── PREFERENCES ── */}
                {activeTab === "preferences" && (
                  <div className="space-y-6 max-w-md">
                    {/* Privacy toggle */}
                    <div className="flex items-center justify-between gap-6 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#7C3AFF] mt-0.5 shrink-0" strokeWidth={1.5} />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Herkese Açık Profil</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {isPublic
                              ? "Bağlantınıza sahip olan herkes profilinizi ve aktif projelerinizi görebilir."
                              : "Profilinizi yalnızca siz görebilirsiniz. Diğer kullanıcılar profilin gizli olduğunu görür."}
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
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-sm transition-transform duration-200"
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

      {/* ── E-POSTA ONAYLI KALICI HESAP SİLME MODALI ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteConfirming) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="w-[95vw] max-w-md rounded-2xl bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Başlık */}
            <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                    Hesabı Kalıcı Olarak Kapat
                  </h3>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                    Bu işlem geri alınamaz
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={deleteConfirming}
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Uyarı Açıklaması */}
            <div className="rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 p-3.5 space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-rose-700 dark:text-rose-300">
                Hesabınızı sildiğinizde neler olur?
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Tüm profil verileriniz, puanlarınız ve rozetleriniz silinir.</li>
                <li>Sahip olduğunuz projeler ve diğer projelerdeki üyelikleriniz kaldırılır.</li>
                <li>
                  Kimlik kaydınız tamamen temizlenir; dilerseniz daha sonra{" "}
                  <strong className="text-slate-900 dark:text-white break-all">{email}</strong>{" "}
                  adresiyle sıfırdan yeniden kayıt olabilirsiniz.
                </li>
              </ul>
            </div>

            {/* E-posta Doğrulama Kodu Gönderme Bölümü */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Kayıtlı E-Posta Adresiniz
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium truncate">
                    {email}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendDeleteAccountOtp}
                    disabled={deleteOtpSending || deleteOtpCooldown > 0 || deleteConfirming}
                    className="shrink-0 min-h-[42px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-55 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {deleteOtpSending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : deleteOtpCooldown > 0 ? (
                      <span>Tekrar Gönder ({deleteOtpCooldown}s)</span>
                    ) : deleteOtpSent ? (
                      <span>Kodu Yeniden Gönder</span>
                    ) : (
                      <span>Doğrulama Kodu Gönder</span>
                    )}
                  </button>
                </div>
              </div>

              {deleteModalInfo && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  {deleteModalInfo}
                </div>
              )}

              {deleteModalError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-300 leading-relaxed">
                  {deleteModalError}
                </div>
              )}

              {/* 6 Haneli Kod Giriş Formu */}
              <form onSubmit={handleConfirmDeleteAccount} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label
                    htmlFor="delete-otp-input"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                  >
                    6 Haneli E-Posta Doğrulama Kodu
                  </label>
                  <input
                    id="delete-otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={deleteOtpCode}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setDeleteOtpCode(digitsOnly);
                      if (deleteModalError) setDeleteModalError(null);
                    }}
                    placeholder="Örn: 123456"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-mono text-lg font-bold tracking-[0.35em] text-slate-900 dark:text-white placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">
                    E-posta kutunuza gelen 6 haneli kodu girin. Kod 10 dakika boyunca geçerlidir.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={deleteConfirming}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={deleteConfirming || deleteOtpCode.trim().length !== 6}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/25 transition-all cursor-pointer"
                  >
                    {deleteConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Hesap Siliniyor...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Hesabımı Kalıcı Olarak Sil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

