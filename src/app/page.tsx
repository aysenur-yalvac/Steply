"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  FolderGit2,
  BarChart3,
  MessageSquare,
  FileText,
  Calendar,
  CheckSquare,
  Sparkles,
  ChevronRight,
  Cloud,
  FileCheck,
  Bell,
  Users,
  LayoutDashboard,
  School,
  Settings,
  Trash2,
  ArrowUpRight
} from "lucide-react";
import LegalModal from "@/components/layout/LegalModal";
import CanvasParticles from "@/components/ui/CanvasParticles";
import NeuralNoise from "@/components/ui/neural-noise";

type LegalSlug = "privacy" | "terms" | "kvkk" | "cookies" | "contact";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"projects" | "analytics" | "messages">("projects");
  const [copied, setCopied] = useState(false);
  const [openLegalModal, setOpenLegalModal] = useState<LegalSlug | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@mustbacademy.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#070B14] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 font-sans relative overflow-hidden">
      {openLegalModal && (
        <LegalModal slug={openLegalModal} onClose={() => setOpenLegalModal(null)} />
      )}

      {/* ── Arka Plan Parçacık ve Işık Animasyonları ── */}
      <CanvasParticles />
      <NeuralNoise color={[0.55, 0.25, 0.95]} opacity={0.75} speed={0.0008} />

      {/* Mor / Eflatun Süzülen Işık Küreleri */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.18, 0.28, 0.18],
            x: [0, 25, 0],
            y: [0, -25, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-violet-600/20 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.12, 0.22, 0.12],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-purple-600/18 blur-[160px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.14, 0.24, 0.14],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 left-1/3 w-[800px] h-[600px] rounded-full bg-indigo-600/15 blur-[160px]"
        />
      </div>

      {/* ── 1. Yapışkan Üst Menü (Sticky Header) ── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#070B14]/90 backdrop-blur-xl border-b border-violet-500/20 shadow-lg shadow-black/40 py-3"
            : "bg-transparent py-5 border-b border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 shadow-md shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
              <img
                src="/marka/logo-dark.png"
                alt="Must-b Academy"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1.5">
                Must-b <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">Academy</span>
              </span>
              <span className="text-[10px] tracking-wider text-violet-400/80 uppercase font-semibold">
                Akıllı Akademi Paneli
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#nasil-calisir" className="hover:text-violet-400 transition-colors">Nasıl Çalışır</a>
            <a href="#canli-demo" className="hover:text-violet-400 transition-colors">Canlı Demo</a>
            <a href="#panelin-ici" className="hover:text-violet-400 transition-colors">Panelin İçi</a>
            <a href="#guvenlik" className="hover:text-violet-400 transition-colors">Güvenlik</a>
            <a href="#iletisim" className="hover:text-violet-400 transition-colors">İletişim</a>
          </nav>

          {/* Sağ Eylemler: Giriş Yap + Mor Kayıt Ol */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/auth/login"
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-600/30 hover:shadow-violet-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Kayıt Ol</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Üst Karşılama Alanı (Hero Section) ── */}
      <section className="relative pt-16 sm:pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center z-10">
        {/* Maskot Çerçevesi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-8 group"
        >
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-violet-600/40 via-purple-500/30 to-indigo-600/40 blur-2xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-b from-violet-400/80 via-purple-600/40 to-slate-950 border border-violet-400/40 shadow-2xl shadow-violet-900/40">
            <img
              src="/marka/logo-dark.png"
              alt="Must-b Academy Mascot"
              className="w-full h-full object-cover rounded-[20px]"
            />
          </div>
        </motion.div>

        {/* Ana Başlık */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.12]"
        >
          Öğretmen ve Öğrenci İş Birliğini{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            Dijitalleştiren
          </span>{" "}
          Akıllı Akademi Paneli
        </motion.h1>

        {/* Açıklama */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-base sm:text-lg text-slate-300/90 mb-10 leading-relaxed"
        >
          Öğretmenlerin ve öğrencilerin projeleri, sınıfları, takvimleri, ödevleri ve ekip içi mesajlaşmalarını tek bir güvenli çatı altında buluşturan yeni nesil akademik çalışma ortamı.
        </motion.p>

        {/* Çift Buton (Kayıt Ol + Tanışalım) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/auth/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-violet-600/35 hover:shadow-violet-600/55 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Kayıt Ol</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#nasil-calisir"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-violet-500/50 transition-all hover:-translate-y-0.5"
          >
            <span>Tanışalım</span>
            <ChevronRight className="w-5 h-5 text-violet-400" />
          </a>
        </motion.div>
      </section>
      {/* ── 3. Nasıl Çalışır (3 Adım + Vurgu Şeridi) ── */}
      <section id="nasil-calisir" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2">3 Basit Adımda Başlayın</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Nasıl Çalışır?</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Adım 1 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all group"
          >
            <span className="text-5xl font-black bg-gradient-to-br from-violet-400 to-purple-600 bg-clip-text text-transparent block mb-5">
              01
            </span>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
              Rolünüzle Katılın
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Öğretmen veya öğrenci hesabınızla saniyeler içinde sisteme dahil olun ve çalışma alanınızı oluşturun.
            </p>
          </motion.div>

          {/* Adım 2 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all group"
          >
            <span className="text-5xl font-black bg-gradient-to-br from-violet-400 to-purple-600 bg-clip-text text-transparent block mb-5">
              02
            </span>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
              Projeleri ve Görevleri Planlayın
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ekip arkadaşlarınızı projelere davet edin, dosyalarınızı yükleyin ve teslim tarihlerini takvime işleyin.
            </p>
          </motion.div>

          {/* Adım 3 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all group"
          >
            <span className="text-5xl font-black bg-gradient-to-br from-violet-400 to-purple-600 bg-clip-text text-transparent block mb-5">
              03
            </span>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
              İlerlemeyi Anlık Takip Edin
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gerçek zamanlı mesajlaşma, bildirimler ve performans analizleriyle her adımı kontrol altında tutun.
            </p>
          </motion.div>
        </div>

        {/* Vurgu Şeridi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-slate-900/60 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-violet-950/30"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center shrink-0 text-violet-400 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">Dağınık mesaj gruplarına ve kaybolan dosyalara son!</h4>
              <p className="text-xs sm:text-sm text-slate-400">Tüm akademik süreç tek panelde, şeffaf ve her an erişilebilir.</p>
            </div>
          </div>
          <Link
            href="/auth/register"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-600/30 transition-all hover:-translate-y-0.5"
          >
            <span>Hemen Başla</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── 4. Canlı Demo (Etkileşimli Panel Önizlemesi) ── */}
      <section id="canli-demo" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2">Canlı Arayüz Önizlemesi</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Must-b Academy Paneli İş Başında</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Sekmelere tıklayarak farklı modüllerin arayüzünü canlı olarak deneyimleyin.
          </p>
        </motion.div>

        {/* Sekme Butonları */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "projects"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/35 border border-violet-400/50"
                : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-violet-500/30"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Proje & Görev Takibi</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/35 border border-violet-400/50"
                : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-violet-500/30"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analiz & İlerleme</span>
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "messages"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/35 border border-violet-400/50"
                : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-violet-500/30"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ekip İçi Mesajlaşma</span>
          </button>
        </div>

        {/* Tarayıcı Penceresi Çerçevesi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="w-full rounded-2xl bg-[#0B1120] border border-violet-500/25 shadow-2xl shadow-violet-950/40 overflow-hidden"
        >
          {/* Tarayıcı Başlığı & Adres Çubuğu */}
          <div className="px-4 py-3 bg-[#080D19] border-b border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex-1 max-w-md mx-auto py-1 px-4 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs text-slate-400 text-center font-mono truncate flex items-center justify-center gap-2">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>academy.must-b.com/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span className="hidden sm:inline">Must-b OS v2.4</span>
            </div>
          </div>

          {/* Dinamik İçerik Alanı */}
          <div className="p-6 sm:p-8 min-h-[380px] bg-gradient-to-b from-[#0B1120] to-[#070B14]">
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">Akıllı Kampüs ve Veri Analitiği Projesi</h4>
                    <p className="text-xs text-slate-400">Danışman: Prof. Dr. Melis Acar • 4 Öğrenci Ekibi</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-600/20 text-violet-300 border border-violet-500/40">
                    %78 Tamamlandı
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-500 h-2.5 rounded-full" style={{ width: "78%" }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Tamamlanan</span>
                    <p className="text-sm font-semibold text-white mt-1">Literatür Taraması & Rapor</p>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-3 font-medium">✓ Onaylandı</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-violet-500/40 shadow-sm shadow-violet-500/10">
                    <span className="text-[10px] text-violet-400 uppercase font-bold">Devam Eden</span>
                    <p className="text-sm font-semibold text-white mt-1">Veri Analizi ve Model Geliştirme</p>
                    <span className="text-[10px] text-violet-300 flex items-center gap-1 mt-3 font-medium">⏳ Teslim: 3 Gün</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">İnceleme</span>
                    <p className="text-sm font-semibold text-white mt-1">Final Sunum Taslağı</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-3 font-medium">Beklemede</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">Haftalık Performans & Teslim Oranları</h4>
                    <p className="text-xs text-slate-400">Son 30 gün içinde tamamlanan akademik görev analizleri</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    +%24 Verimlilik Artışı
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/30 transition-colors">
                    <span className="text-xs text-slate-400">Aktif Proje</span>
                    <p className="text-2xl font-black text-violet-400 mt-1">12</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/30 transition-colors">
                    <span className="text-xs text-slate-400">Tamamlanan Görev</span>
                    <p className="text-2xl font-black text-white mt-1">84</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/30 transition-colors">
                    <span className="text-xs text-slate-400">Ortalama Süre</span>
                    <p className="text-2xl font-black text-white mt-1">4.2 Gün</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/30 transition-colors">
                    <span className="text-xs text-slate-400">Zamanında Teslim</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">%94</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Haftalık proje raporu otomatik olarak danışman öğretmen onayına sunuldu.</span>
                  <span className="text-violet-400 font-semibold cursor-pointer hover:text-violet-300 transition-colors flex items-center gap-1">
                    Detayları Gör <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/50 text-violet-300 font-bold flex items-center justify-center text-xs">
                    SK
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Doç. Dr. Selin Korkmaz</h5>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">● Çevrimiçi • Tez Danışmanı</p>
                  </div>
                </div>
                <div className="space-y-3 py-2 text-xs">
                  <div className="flex gap-2.5 max-w-[80%]">
                    <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-800 text-slate-200 leading-relaxed">
                      Merhaba ekip, yüklediğiniz veri analitiği taslağını inceledim. Model metriklerini güncelleyip takvime teslim notu düşebilir misiniz?
                    </div>
                  </div>
                  <div className="flex gap-2.5 max-w-[80%] ml-auto justify-end">
                    <div className="p-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-md shadow-violet-600/20 leading-relaxed">
                      Hemen inceliyoruz hocam, revizyonu bugün saat 18:00'e kadar sisteme yüklemiş olacağız!
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <button className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold opacity-80 cursor-not-allowed">
                    Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>
      {/* ── 5. Panelin İçi (Gerçek Sidebar Modülleriyle 6 Kart) ── */}
      <section id="panelin-ici" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2">Eksiksiz Donanım</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Panelin İçinde Neler Var?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Akademik proje ve eğitim yönetimini kusursuz kılmak için sol menümüzde yer alan entegre çalışma alanları.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. Projelerim */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all mb-5 shadow-inner">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Projelerim</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Tüm akademik çalışmalarınızı, kilometre taşlarınızı, ekip arkadaşlarınızı ve ilerleme durumlarını tek merkezden yönetin.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Ekip davetleri & görev listeleri</span>
            </div>
          </motion.div>

          {/* 2. Analiz */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all mb-5 shadow-inner">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Analiz</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Öğrenci puanları, sınıf ve üniversite genelindeki başarı liderlik tablosu ile anlık gelişim metriklerini izleyin.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Global & Üniversite Liderlik Tablosu</span>
            </div>
          </motion.div>

          {/* 3. Takvim (Ajanda) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all mb-5 shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Takvim</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Önemli teslim tarihleri, sunum günleri ve haftalık akademik ajandanızla hiçbir son tarihi kaçırmayın.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Gantt görünümü & ajanda yönetimi</span>
            </div>
          </motion.div>

          {/* 4. Okulum */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all mb-5 shadow-inner">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Okulum</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Kayıtlı olduğunuz üniversite veya kurum bünyesindeki danışman öğretmenleri, aktif sınıfları ve öğrenci ağını keşfedin.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Öğretmen profilleri & sınıf katılımı</span>
            </div>
          </motion.div>

          {/* 5. Mesajlar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all mb-5 shadow-inner">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Mesajlar</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Danışmanınız ve takım arkadaşlarınızla anlık birebir veya proje bazlı güvenli iletişim kurun.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Gerçek zamanlı sohbet & kullanıcı arama</span>
            </div>
          </motion.div>

          {/* 6. Çöp Kutusu & Arşiv */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all mb-5 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Çöp Kutusu & Dosyalar</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Yanlışlıkla silinen projeleri ve kaynak dokümanları güvenle geri yükleyin veya kalıcı olarak temizleyin.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Projeler & dosyalar için güvenli geri yükleme</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. Beyaz Zeminli Vurgu Bölümü (Kontrast Alanı) ── */}
      <section className="w-full !bg-white text-slate-900 py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Sol Sütun: Avantajlar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-violet-600">Neden Must-b Academy?</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold !text-slate-900 tracking-tight leading-tight">
              Geleneksel Eğitimi Dijital Verimlilikle Birleştiriyoruz
            </h2>
            <p className="!text-slate-600 text-base sm:text-lg leading-relaxed">
              Akademi dünyasının ihtiyaç duyduğu güvenlik, hız ve netliği tek bir arayüzde buluşturduk. Dağınık e-posta zincirleri yerine doğrudan projeye odaklanın.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold !text-slate-900">Rol Bazlı Yetkilendirme</h4>
                  <p className="text-sm !text-slate-600">Öğretmenler denetler, rehberlik eder ve onaylar; öğrenciler ekipleriyle birlikte üretir.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold !text-slate-900">Anlık Davet ve Bildirim Sistemi</h4>
                  <p className="text-sm !text-slate-600">Yeni proje davetiyeleri ve mesajlar bildirim zilinden tek tıkla kabul veya reddedilir.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold !text-slate-900">Bulut Tabanlı Dosya ve Proje Arşivi</h4>
                  <p className="text-sm !text-slate-600">Kaybolan proje dosyaları tarih olur; her dönemin çalışmaları düzenli depolanır.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold !text-slate-900">Sade ve Hızlı Arayüz</h4>
                  <p className="text-sm !text-slate-600">Gereksiz karmaşıklıktan arındırılmış, modern ve ultra akıcı kullanıcı deneyimi.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sağ Sütun: Gerçek İşleyişi Yansıtan Önizleme Kartı */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl space-y-6">
              {/* Başlık & Rol Rozeti */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-violet-600/30">
                    MB
                  </div>
                  <div>
                    <h5 className="font-bold !text-white text-sm">Must-b Academy</h5>
                    <span className="text-xs !text-slate-300">Akademik Çalışma Alanı</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 !text-violet-200 border border-violet-400/40">
                  Öğrenci Hesabı
                </span>
              </div>

              {/* Gerçek Bildirim Paneli Davetiyesi */}
              <div className="p-4 rounded-2xl bg-white border border-violet-100 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 font-bold text-xs border border-violet-200">
                  AH
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">Yeni Proje Davetiyesi</p>
                    <span className="text-[10px] text-slate-400">şimdi</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    <span className="font-semibold text-slate-900">Ahmet Hakan</span> seni <span className="text-violet-700 font-semibold">"Akıllı Kampüs ve Veri Analitiği"</span> projesine davet etti.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-bold text-[11px] shadow-sm">
                      Kabul Et
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 !text-slate-200 font-bold text-[11px] border border-slate-600 cursor-pointer transition-colors">
                      Reddet
                    </span>
                  </div>
                </div>
              </div>

              {/* Proje Görev Özeti */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Proje Görevleri & Dosyalar</span>
                  <span className="text-violet-600 font-extrabold">%85 Tamamlandı</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-500 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-violet-600" /> 6 Doküman Paylaşıldı
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> 18/21 Görev Bitti
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ── 7. Güvenlik ve KVKK Bölümü ── */}
      <section id="guvenlik" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2">Maksimum Koruma</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Güvenlik ve Veri Gizliliği</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Akademik verileriniz ve öğrenci kayıtlarınız kurumsal düzeyde korunur.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Rol Bazlı Erişim (RLS)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğretmen ve öğrenci yetkileri veritabanı seviyesinde izole edilir; yetkisiz veri erişimi imkânsızdır.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Şifreli Veri İletimi</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tüm ağ trafiği uçtan uca TLS/SSL şifreleme ve güvenli oturum anahtarlarıyla korunur.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4 shadow-inner">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">KVKK Uyumlu Altyapı</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kişisel Verilerin Korunması Kanunu standartlarına tam uyumlu veri saklama ve işleme mimarisi.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4 shadow-inner">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Kesintisiz Bulut Erişimi</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yedekli sunucularla %99.9 çalışma süresi ve her cihazdan kesintisiz, hızlı erişim imkânı.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 8. İletişim Kutusu ── */}
      <section id="iletisim" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full scroll-mt-20 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#0B1120] to-[#070B14] border border-violet-500/30 text-center space-y-6 shadow-2xl shadow-violet-950/40"
        >
          <span className="text-xs font-bold tracking-widest uppercase text-violet-400">Bizimle İletişime Geçin</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Sorularınız veya Kurumsal İş Birlikleri İçin Bize Ulaşın
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Akademik kurumunuz veya sınıfınız için özel yapılandırma taleplerinizde destek ekibimiz her zaman yanınızda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Email Box + Copy Button */}
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 border border-violet-500/30 text-slate-200 text-sm font-mono shadow-inner">
              <a href="mailto:support@mustbacademy.com" className="hover:text-violet-400 transition-colors">
                support@mustbacademy.com
              </a>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-400 hover:text-white transition-colors"
                title="E-postayı kopyala"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5"
            >
              <span>Kayıt Ol</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 9. Kurumsal Footer (4 Sütunlu) ── */}
      <footer className="w-full bg-[#05080F] border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* 1. Sütun: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/marka/logo-dark.png" alt="Must-b Academy" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-extrabold text-lg text-white">Must-b Academy</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Öğretmen ve öğrenci iş birliğini güçlendiren, modern ve akıllı proje yönetim platformu.
            </p>
            <p className="text-[11px] text-slate-500">
              © 2026 Must-b Academy. Tüm hakları saklıdır.
            </p>
          </div>

          {/* 2. Sütun: Platform */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#nasil-calisir" className="hover:text-violet-400 transition-colors">Nasıl Çalışır</a></li>
              <li><a href="#canli-demo" className="hover:text-violet-400 transition-colors">Canlı Demo</a></li>
              <li><a href="#panelin-ici" className="hover:text-violet-400 transition-colors">Panelin İçi</a></li>
              <li><a href="#guvenlik" className="hover:text-violet-400 transition-colors">Güvenlik</a></li>
            </ul>
          </div>

          {/* 3. Sütun: Erişim */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Erişim</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/login" className="hover:text-violet-400 transition-colors">Panele Giriş</Link></li>
              <li><Link href="/auth/register" className="hover:text-violet-400 transition-colors">Kayıt Ol</Link></li>
            </ul>
          </div>

          {/* 4. Sütun: İletişim & Yasal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">İletişim & Yasal</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@mustbacademy.com" className="hover:text-violet-400 transition-colors">
                  support@mustbacademy.com
                </a>
              </li>
              <li>
                <button onClick={() => setOpenLegalModal("kvkk")} className="hover:text-violet-400 transition-colors">
                  KVKK Aydınlatma Metni
                </button>
              </li>
              <li>
                <button onClick={() => setOpenLegalModal("privacy")} className="hover:text-violet-400 transition-colors">
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button onClick={() => setOpenLegalModal("terms")} className="hover:text-violet-400 transition-colors">
                  Kullanım Koşulları
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <span>Powered by Must-b Ecosystem</span>
          <span>academy.must-b.com</span>
        </div>
      </footer>
    </div>
  );
}
