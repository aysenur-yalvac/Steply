"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Bell
} from "lucide-react";
import LegalModal from "@/components/layout/LegalModal";

type LegalSlug = "privacy" | "terms" | "kvkk" | "cookies" | "contact";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"projects" | "analytics" | "messages">("projects");
  const [copied, setCopied] = useState(false);
  const [openLegalModal, setOpenLegalModal] = useState<LegalSlug | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@mustbacademy.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#070B14] text-slate-100 selection:bg-amber-500/20 selection:text-amber-300 font-sans">
      {openLegalModal && (
        <LegalModal slug={openLegalModal} onClose={() => setOpenLegalModal(null)} />
      )}

      {/* ── 1. Üst Gezinme Çubuğu (Sticky Navbar) ── */}
      <header className="sticky top-0 z-50 w-full bg-[#070B14]/85 backdrop-blur-xl border-b border-amber-500/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:shadow-[0_0_28px_rgba(245,158,11,0.45)] transition-all">
              <img
                src="/marka/logo-dark.png"
                alt="Must-b Academy"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1.5">
                Must-b <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Academy</span>
              </span>
              <span className="text-[10px] tracking-wider text-amber-400/80 uppercase font-semibold">
                Akıllı Akademi Paneli
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#nasil-calisir" className="hover:text-amber-400 transition-colors">Nasıl Çalışır</a>
            <a href="#canli-demo" className="hover:text-amber-400 transition-colors">Canlı Demo</a>
            <a href="#panelin-ici" className="hover:text-amber-400 transition-colors">Panelin İçi</a>
            <a href="#guvenlik" className="hover:text-amber-400 transition-colors">Güvenlik</a>
            <a href="#iletisim" className="hover:text-amber-400 transition-colors">İletişim</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Panele Giriş</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Üst Karşılama Alanı (Hero Section) ── */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[680px] h-[480px] bg-amber-500/10 rounded-full blur-[140px]" />
          <div className="w-[900px] h-[550px] bg-indigo-900/15 rounded-full blur-[160px] -translate-y-20" />
        </div>

        <div className="relative mb-8 group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500/40 via-amber-300/30 to-amber-600/40 blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-b from-amber-400/80 via-amber-600/30 to-slate-900 border border-amber-400/40 shadow-2xl">
            <img
              src="/marka/logo-dark.png"
              alt="Must-b Academy Mascot"
              className="w-full h-full object-cover rounded-[20px]"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 bg-amber-950/40 border border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Eğitim ve Proje Yönetiminde Yeni Standart</span>
        </div>

        <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.12]">
          Öğretmen ve Öğrenci İş Birliğini{" "}
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            Dijitalleştiren
          </span>{" "}
          Akıllı Akademi Paneli
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-slate-300/90 mb-10 leading-relaxed">
          Öğretmenlerin ve öğrencilerin projeleri, ödevleri, dosyaları, teslim takvimlerini ve ekip içi mesajlaşmalarını tek bir güvenli panelde buluşturan yeni nesil akademik çalışma ortamı.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.4)] hover:shadow-[0_0_36px_rgba(245,158,11,0.6)] transition-all transform hover:-translate-y-0.5"
          >
            <span>Panele Giriş</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#nasil-calisir"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 transition-all"
          >
            <span>Tanışalım</span>
            <ChevronRight className="w-5 h-5 text-amber-400" />
          </a>
        </div>
      </section>
      {/* ── 3. Nasıl Çalışır (3 Adım + Vurgu Şeridi) ── */}
      <section id="nasil-calisir" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">3 Basit Adımda Başlayın</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Nasıl Çalışır?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Adım 1 */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all group">
            <span className="text-5xl font-black bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent block mb-5">
              01
            </span>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
              Rolünüzle Katılın
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Öğretmen veya öğrenci hesabınızla saniyeler içinde sisteme dahil olun ve çalışma alanınızı oluşturun.
            </p>
          </div>

          {/* Adım 2 */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all group">
            <span className="text-5xl font-black bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent block mb-5">
              02
            </span>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
              Projeleri ve Görevleri Planlayın
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ekip arkadaşlarınızı projelere davet edin, dosyalarınızı yükleyin ve teslim tarihlerini takvime işleyin.
            </p>
          </div>

          {/* Adım 3 */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all group">
            <span className="text-5xl font-black bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent block mb-5">
              03
            </span>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
              İlerlemeyi Anlık Takip Edin
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gerçek zamanlı mesajlaşma, bildirimler ve performans analizleriyle her adımı kontrol altında tutun.
            </p>
          </div>
        </div>

        {/* Vurgu Şeridi */}
        <div className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">Dağınık mesaj gruplarına ve kaybolan dosyalara son!</h4>
              <p className="text-xs sm:text-sm text-slate-400">Tüm akademik süreç tek panelde, şeffaf ve her an erişilebilir.</p>
            </div>
          </div>
          <Link
            href="/login"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md"
          >
            <span>Hemen Başla</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── 4. Canlı Demo (Etkileşimli Panel Önizlemesi) ── */}
      <section id="canli-demo" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">Canlı Arayüz Önizlemesi</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Must-b Academy Paneli İş Başında</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Sekmelere tıklayarak farklı modüllerin arayüzünü canlı olarak deneyimleyin.
          </p>
        </div>

        {/* Sekme Butonları */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "projects"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Proje & Görev Takibi</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analiz & İlerleme</span>
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "messages"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ekip İçi Mesajlaşma</span>
          </button>
        </div>

        {/* Tarayıcı Penceresi Çerçevesi */}
        <div className="w-full rounded-2xl bg-[#0B1120] border border-amber-500/25 shadow-2xl overflow-hidden">
          {/* Tarayıcı Başlığı & Adres Çubuğu */}
          <div className="px-4 py-3 bg-[#080D19] border-b border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
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
                    <h4 className="text-xl font-bold text-white">Yapay Zekâ Destekli Hukuk Asistanı</h4>
                    <p className="text-xs text-slate-400">Danışman: Prof. Dr. Melis Acar • 4 Öğrenci</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    %78 Tamamlandı
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full" style={{ width: "78%" }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Yapılacaklar</span>
                    <p className="text-sm font-semibold text-white mt-1">Literatür Taraması & Rapor</p>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-3">✓ Tamamlandı</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Devam Eden</span>
                    <p className="text-sm font-semibold text-white mt-1">Veri Seti Etiketleme</p>
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-3">⏳ Teslim: 3 Gün</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">İnceleme</span>
                    <p className="text-sm font-semibold text-white mt-1">Final Sunum Taslağı</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-3">Beklemede</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">Haftalık Performans & Teslim Oranları</h4>
                    <p className="text-xs text-slate-400">Son 30 gün içinde tamamlanan görev analizleri</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">+%24 Verimlilik Artışı</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-xs text-slate-400">Aktif Proje</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">12</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-xs text-slate-400">Tamamlanan Görev</span>
                    <p className="text-2xl font-black text-white mt-1">84</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-xs text-slate-400">Ortalama Süre</span>
                    <p className="text-2xl font-black text-white mt-1">4.2 Gün</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-xs text-slate-400">Zamanında Teslim</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">%94</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Haftalık proje raporu otomatik olarak öğretmen onayına sunuldu.</span>
                  <span className="text-amber-400 font-semibold cursor-pointer">Detayları Gör →</span>
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                    MA
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Doç. Dr. Selin Korkmaz</h5>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">● Çevrimiçi • Danışman</p>
                  </div>
                </div>
                <div className="space-y-3 py-2 text-xs">
                  <div className="flex gap-2.5 max-w-[80%]">
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-800 text-slate-200">
                      Merhaba ekip, yüklediğiniz veri setini inceledim. Modül 3 parametrelerini güncelleyip takvime teslim notu düşebilir misiniz?
                    </div>
                  </div>
                  <div className="flex gap-2.5 max-w-[80%] ml-auto justify-end">
                    <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium">
                      Hemen inceliyoruz hocam, revizyonu bugün saat 18:00'e kadar sisteme yüklemiş olacağız!
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <button className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold opacity-80 cursor-not-allowed">
                    Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* ── 5. Panelin İçi (6 Modül Kartı — 3×2 Izgara) ── */}
      <section id="panelin-ici" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">Eksiksiz Donanım</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Panelin İçinde Neler Var?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Akademik proje ve eğitim yönetimini kusursuz kılmak için tasarlanmış 6 entegre modül.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. Projeler */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Projeler</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Aktif ve arşivlenen tüm akademik projeler, ekip üyeleri ve canlı ilerleme yüzdeleri tek bakışta.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              ✓ Ekip davetleri & çoklu yönetici desteği
            </div>
          </div>

          {/* 2. Analiz */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analiz</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Öğrenci ve sınıf bazında detaylı tamamlanma oranları, haftalık aktivite grafikleri ve başarı liderliği.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              ✓ Gerçek zamanlı performans metrikleri
            </div>
          </div>

          {/* 3. Mesajlar */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Mesajlar</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Öğretmen-öğrenci ve proje grupları için doğrudan anlık mesajlaşma ve dosya paylaşım altyapısı.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              ✓ Okundu bilgisi & hızlı arama
            </div>
          </div>

          {/* 4. Dosyalar */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dosyalar</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Proje dokümanları, kod dosyaları, sunumlar ve kaynaklar için kategorili ve güvenli bulut deposu.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              ✓ Versiyon kontrolü & önizleme
            </div>
          </div>

          {/* 5. Takvim */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Takvim</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Teslim tarihleri, jüri sunumları ve haftalık proje toplantıları için senkronize takvim sistemi.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              ✓ Yaklaşan etkinlik alarmları
            </div>
          </div>

          {/* 6. Bugün */}
          <div className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0A0F1D]/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Bugün</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Günün öncelikli görevleri, acil teslimler ve yapıldı işaretleme mekanizmasıyla odaklanmış çalışma.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              ✓ Tek tıkla görev tamamlama
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Beyaz Zeminli Vurgu Bölümü (Kontrast Alanı) ── */}
      <section className="w-full bg-white text-slate-900 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-600">Neden Must-b Academy?</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Geleneksel Eğitimi Dijital Verimlilikle Birleştiriyoruz
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Akademi dünyasının ihtiyaç duyduğu güvenlik, hız ve netliği tek bir arayüzde buluşturduk. Karmaşık menüler yerine doğrudan sonuca odaklanın.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Rol Bazlı Yetkilendirme</h4>
                  <p className="text-sm text-slate-600">Öğretmenler denetler ve puanlar; öğrenciler ekipleriyle birlikte üretir.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Anlık Davet ve Bildirim Sistemi</h4>
                  <p className="text-sm text-slate-600">Yeni proje davetiyeleri ve mesajlar tek merkezden, anında onaylanır.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Bulut Tabanlı Dosya Arşivi</h4>
                  <p className="text-sm text-slate-600">Kaybolan e-postalar ve ödev bağlantıları tarih olur; tüm içerik yedeklenir.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Sade ve Hızlı Arayüz</h4>
                  <p className="text-sm text-slate-600">Gereksiz karmaşıklıktan arındırılmış, modern ve ultra akıcı kullanıcı deneyimi.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm">
                    MB
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Must-b Proje Masası</h5>
                    <span className="text-xs text-slate-500">Bahar Dönemi Akademik Çalışmaları</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Aktif
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-900">Yeni Proje Davetiyesi</p>
                  <p className="text-slate-600 mt-0.5">Ahmet Hakan seni "Biyo-Mühendislik Projesi"ne davet etti.</p>
                  <div className="flex gap-2 mt-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px]">Kabul Et</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px]">Reddet</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>Dönem Teslimat Durumu</span>
                  <span className="text-amber-600">%85</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── 7. Güvenlik ve KVKK Bölümü ── */}
      <section id="guvenlik" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">Maksimum Koruma</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Güvenlik ve Veri Gizliliği</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Akademik verileriniz ve öğrenci kayıtlarınız kurumsal düzeyde korunur.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Rol Bazlı Erişim (RLS)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Öğretmen ve öğrenci yetkileri veritabanı seviyesinde ayrıştırılır; yetkisiz erişim imkânsızdır.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Şifreli Veri İletimi</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tüm ağ trafiği uçtan uca TLS/SSL şifreleme ve güvenli oturum anahtarlarıyla korunur.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">KVKK Uyumlu Altyapı</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kişisel Verilerin Korunması Kanunu standartlarına tam uyumlu veri saklama ve işleme mimarisi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Kesintisiz Bulut Erişimi</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yedekli sunucularla %99.9 çalışma süresi ve her cihazdan kesintisiz, hızlı erişim imkânı.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. İletişim Kutusu ── */}
      <section id="iletisim" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full scroll-mt-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#0B1120] to-[#070B14] border border-amber-500/30 text-center space-y-6 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">Bizimle İletişime Geçin</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Sorularınız veya Kurumsal İş Birlikleri İçin Bize Ulaşın
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Akademik kurumunuz veya sınıfınız için özel yapılandırma taleplerinizde destek ekibimiz her zaman yanınızda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-slate-200 text-sm font-mono">
              <a href="mailto:support@mustbacademy.com" className="hover:text-amber-400 transition-colors">
                support@mustbacademy.com
              </a>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                title="E-postayı kopyala"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg transition-all"
            >
              <span>Panele Giriş</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. Kurumsal Footer (4 Sütunlu) ── */}
      <footer className="w-full bg-[#05080F] border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
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
              <li><a href="#nasil-calisir" className="hover:text-amber-400 transition-colors">Nasıl Çalışır</a></li>
              <li><a href="#canli-demo" className="hover:text-amber-400 transition-colors">Canlı Demo</a></li>
              <li><a href="#panelin-ici" className="hover:text-amber-400 transition-colors">Panelin İçi</a></li>
              <li><a href="#guvenlik" className="hover:text-amber-400 transition-colors">Güvenlik</a></li>
            </ul>
          </div>

          {/* 3. Sütun: Erişim */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Erişim</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-amber-400 transition-colors">Panele Giriş</Link></li>
              <li><Link href="/auth/register" className="hover:text-amber-400 transition-colors">Hesap Oluştur</Link></li>
            </ul>
          </div>

          {/* 4. Sütun: İletişim & Hukuki */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">İletişim & Hukuki</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@mustbacademy.com" className="hover:text-amber-400 transition-colors">
                  support@mustbacademy.com
                </a>
              </li>
              <li>
                <button onClick={() => setOpenLegalModal("kvkk")} className="hover:text-amber-400 transition-colors">
                  KVKK Aydınlatma Metni
                </button>
              </li>
              <li>
                <button onClick={() => setOpenLegalModal("privacy")} className="hover:text-amber-400 transition-colors">
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button onClick={() => setOpenLegalModal("terms")} className="hover:text-amber-400 transition-colors">
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