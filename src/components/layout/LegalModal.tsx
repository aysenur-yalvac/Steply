"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type LegalSlug = "privacy" | "terms" | "kvkk" | "cookies" | "contact";

const LEGAL_CONTENT: Record<LegalSlug, { title: string; body: string[] }> = {
  privacy: {
    title: "Gizlilik Politikasi",
    body: [
      "Son Guncelleme: Agustos 2025",
      "",
      "Steply olarak kisisel verilerinizin gizliligini ciddiye aliyoruz.",
      "",
      "TOPLANAN VERILER",
      "Ad, soyad, e-posta adresi, kullanici rolu ve kurum bilgisi, yuklenen proje dosyalari.",
      "",
      "VERILERIN KULLANIMI",
      "Verileriniz; hesap yonetimi, platform islevi ve hizmet kalitesinin iyilestirilmesi icin kullanilir. Ucuncu taraflarla ticari amacla paylasilmaz.",
      "",
      "VERI GUVENLIGI",
      "Tum veriler Supabase altyapisinda Row Level Security (RLS) politikalariyla korunmaktadir. Iletisim TLS 1.3 ile sifrelenmektedir.",
      "",
      "Sorulariniz icin: privacy@must-b.com",
    ],
  },
  terms: {
    title: "Kullanim Kosullari",
    body: [
      "Son Guncelleme: Agustos 2025",
      "",
      "Steplyyi kullanarak asagidaki kosullari kabul etmis sayilirsiniz.",
      "",
      "HESAP SORUMLULUGU",
      "Hesabinizin guvenliginden siz sorumlusunuz. Supheli etkinlik farkettiginizde bize bildirin.",
      "",
      "KABUL EDILEMEZ KULLANIM",
      "- Baskalarinin telif haklarini ihlal eden icerikler yuklenmesi",
      "- Platform uzerinden spam veya zararli yazilim yayilmasi",
      "- Diger kullanicilara taciz veya zarar verici davranislar",
      "",
      "HESAP SONLANDIRMA",
      "Kosullari ihlal eden hesaplar uyarisiz kapatiabilir.",
      "",
      "legal@must-b.com",
    ],
  },
  kvkk: {
    title: "KVKK Aydinlatma Metni",
    body: [
      "6698 Sayili Kisisel Verilerin Korunmasi Kanunu Kapsaminda",
      "",
      "Veri Sorumlusu: MUST-B Teknoloji A.S.",
      "",
      "ISLENEN KISISEL VERILER",
      "Ad-soyad, e-posta, IP adresi, kullanim loglari, yuklenen belgeler.",
      "",
      "ISLENME AMACI",
      "Hizmetin sunulmasi, kullanici guvenliginin saglanmasi ve yasal yukumlulukler.",
      "",
      "VERI SAHIBI HAKLARI",
      "KVKK madde 11 kapsaminda; verilerinizin islenip islenmedigini ogrenme, duzeltilmesini veya silinmesini talep etme haklariniz vardir.",
      "",
      "Basvuru: kvkk@must-b.com",
    ],
  },
  cookies: {
    title: "Cerez Politikasi",
    body: [
      "Cerezler, web sitemizi ziyaret ettiginizde tarayiciniza yerlestirilen kucuk veri dosyalaridir.",
      "",
      "KULLANDIGIMIZ CEREZLER",
      "- Zorunlu: Kimlik dogrulama oturumu (oturum suresi)",
      "- Tercih: Tema ve dil tercihleri (1 yil)",
      "- Analitik: Anonim kullanim istatistikleri (6 ay)",
      "",
      "Tarayici ayarlarinizdan cerezleri devre disi birakabilirsiniz.",
      "",
      "cookies@must-b.com",
    ],
  },
  contact: {
    title: "Iletisim ve Haklar",
    body: [
      "MUST-B Teknoloji A.S.",
      "",
      "Genel Iletisim: info@must-b.com",
      "Website: https://must-b.com",
      "",
      "Teknik Destek: support@must-b.com",
      "Hukuki & KVKK: legal@must-b.com",
      "Icerik Kaldirma: abuse@must-b.com",
      "DMCA: dmca@must-b.com",
      "",
      "Tum talepler en gec 5 is gunu icerisinde yanitlanir.",
    ],
  },
};

interface LegalModalProps {
  slug: LegalSlug;
  onClose: () => void;
}

export default function LegalModal({ slug, onClose }: LegalModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { title, body } = LEGAL_CONTENT[slug];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{
          background: "rgba(15,18,26,0.98)",
          border: "1px solid rgba(160,32,240,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-start justify-between gap-4 p-8 pb-4 border-b border-white/[0.08] sticky top-0"
          style={{ background: "rgba(15,18,26,0.98)" }}>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button type="button" onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1 px-8 py-6">
          {body.map((line, i) => {
            if (line === "") return <div key={i} className="h-2" />;
            if (line === line.toUpperCase() && line.length > 4 && !line.includes("@") && !line.startsWith("-") && !line.startsWith("http")) {
              return <p key={i} className="font-bold text-purple-400 text-sm mt-2">{line}</p>;
            }
            if (line.startsWith("- ")) {
              return <p key={i} className="text-slate-300 text-sm ml-4 before:content-['•'] before:mr-2 before:text-purple-400">{line.slice(2)}</p>;
            }
            return <p key={i} className="text-slate-300 text-sm leading-relaxed">{line}</p>;
          })}
        </div>

        <div className="px-8 py-4 border-t border-white/[0.08] text-center">
          <span className="text-xs text-slate-500">
            Powered by <a href="https://must-b.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-semibold hover:text-purple-300">MUST-B</a>
          </span>
        </div>
      </div>
    </div>
  );
}
