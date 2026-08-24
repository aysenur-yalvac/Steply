"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type LegalSlug = "privacy" | "terms" | "kvkk" | "cookies" | "contact";

const LEGAL: Record<LegalSlug, { title: string; sections: { heading?: string; body: string }[] }> = {
  privacy: {
    title: "Gizlilik Politikası",
    sections: [
      {
        body: "Bu Gizlilik Politikası, MUST-B Teknoloji A.Ş. tarafından işletilen Steply platformunun kullanıcı verilerini nasıl topladığını, işlediğini ve koruduğunu açıklamaktadır. Platformumuzu kullanarak bu politikayı kabul etmiş sayılırsınız."
      },
      {
        heading: "1. Toplanan Kişisel Veriler",
        body: "Ad, soyad ve e-posta adresi; seçilen kullanıcı rolü (öğrenci / öğretmen) ve kurum bilgisi; platforma yüklenen proje, ödev ve belgeler; IP adresi, tarayıcı türü ve oturum bilgileri; gönüllü olarak paylaşılan biyografi, profil fotoğrafı ve bağlantı bilgileri."
      },
      {
        heading: "2. Verilerin İşlenme Amaçları",
        body: "Kişisel verileriniz; hesap yönetimi ve kimlik doğrulama, platform hizmetlerinin sunulması ve iyileştirilmesi, kullanıcılar arası etkileşimlerin yönetilmesi, teknik destek sağlanması ve 6698 Sayılı KVKK ile ilgili mevzuattan doğan yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir."
      },
      {
        heading: "3. Verilerin Aktarımı",
        body: "Verileriniz, hizmet altyapımızı sağlayan Supabase (veritabanı ve kimlik doğrulama) ile Vercel (barındırma) platformlarına aktarılmaktadır. Bu aktarımlar KVKK'nın 9. maddesi ve Avrupa Birliği GDPR düzenlemeleri çerçevesinde gerçekleştirilmektedir. Ticari amaçla herhangi bir üçüncü tarafla veri paylaşımı yapılmamaktadır."
      },
      {
        heading: "4. Veri Güvenliği",
        body: "Tüm veriler, PostgreSQL Row Level Security (RLS) politikaları ile korunmaktadır. Kullanıcı oturumları TLS 1.3 protokolü ile şifrelenmekte, depolanan şifreler bcrypt algoritması ile hashlenmektedir."
      },
      {
        heading: "5. İletişim",
        body: "Gizlilik politikamıza ilişkin sorularınız için: privacy@must-b.com"
      }
    ]
  },
  terms: {
    title: "Kullanım Koşulları",
    sections: [
      {
        body: "Bu Kullanım Koşulları, MUST-B Teknoloji A.Ş. tarafından sunulan Steply platformunu kullanmanıza ilişkin yasal çerçeveyi belirlemektedir. Platforma erişim sağlayarak bu koşulları kabul etmiş sayılırsınız."
      },
      {
        heading: "1. Hizmetin Tanımı",
        body: "Steply, öğrencilerin projelerini yönetmesine, öğretmenlerin ödev oluşturmasına ve eğitim süreçlerinin dijital ortamda takip edilmesine olanak tanıyan bir eğitim yönetim platformudur."
      },
      {
        heading: "2. Hesap Sorumluluğu",
        body: "Kullanıcı, hesabının güvenliğinden ve hesabı aracılığıyla gerçekleştirilen tüm işlemlerden münferiden sorumludur. Şüpheli bir erişim tespit edilmesi hâlinde derhal platform yönetimine bildirim yapılması zorunludur."
      },
      {
        heading: "3. Yasaklanan Kullanımlar",
        body: "Başkalarına ait fikrî mülkiyet haklarının ihlali; spam, kötü amaçlı yazılım veya yanıltıcı içerik yayımı; diğer kullanıcılara yönelik taciz, tehdit veya ayrımcı davranışlar; platformun teknik altyapısına zarar verebilecek faaliyetler kesinlikle yasaktır."
      },
      {
        heading: "4. İçerik Sorumluluğu",
        body: "Platforma yüklenen içeriklerden münhasıran içeriği yükleyen kullanıcı sorumludur. MUST-B Teknoloji A.Ş., kullanıcı içeriklerini önceden denetleme yükümlülüğü taşımamakla birlikte, mevzuata aykırı içerikleri kaldırma ve ilgili hesapları askıya alma hakkını saklı tutar."
      },
      {
        heading: "5. Hesap Sonlandırma",
        body: "Bu Kullanım Koşullarını ihlal eden hesaplar, önceden bildirim yapılmaksızın askıya alınabilir veya kalıcı olarak sonlandırılabilir."
      },
      {
        heading: "6. İletişim",
        body: "Hukuki bildirimler ve şikayetler için: legal@must-b.com"
      }
    ]
  },
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    sections: [
      {
        body: "6698 Sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır."
      },
      {
        heading: "Veri Sorumlusu",
        body: "MUST-B Teknoloji Anonim Şirketi — Türkiye"
      },
      {
        heading: "İşlenen Kişisel Veriler",
        body: "Kimlik verileri (ad, soyad); iletişim verileri (e-posta adresi); kullanım verileri (IP adresi, oturum kayıtları, platform aktiviteleri); meslekî veriler (kurum adı, görev belgesi, MEBBİS kodu — yalnızca öğretmen kullanıcılar için); kullanıcı tarafından gönüllü olarak paylaşılan içerikler."
      },
      {
        heading: "İşlenme Amaçları ve Hukuki Dayanaklar",
        body: "KVKK Madde 5/2-c (sözleşmenin ifası): Hizmetin sunulması ve hesap yönetimi. KVKK Madde 5/2-ç (hukuki yükümlülük): Vergi, güvenlik ve diğer yasal düzenlemeler kapsamındaki yükümlülükler. KVKK Madde 5/2-f (meşru menfaat): Platform güvenliğinin sağlanması ve hizmet kalitesinin iyileştirilmesi."
      },
      {
        heading: "Veri Sahibinin Hakları (KVKK Madde 11)",
        body: "Kişisel verilerinizin işlenip işlenmediğini öğrenme; işlenmiş ise buna ilişkin bilgi talep etme; işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme; yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme; eksik veya yanlış işlenmiş ise düzeltilmesini isteme; silinmesini veya yok edilmesini isteme; otomatik sistemler vasıtasıyla aleyhinize bir sonucun ortaya çıkması hâlinde buna itiraz etme; zarara uğranılması hâlinde tazminat talep etme haklarına sahipsiniz."
      },
      {
        heading: "Başvuru Yöntemi",
        body: "Yukarıdaki haklara ilişkin başvurularınızı yazılı olarak kvkk@must-b.com adresine iletebilirsiniz. Başvurunuz en geç 30 gün içinde sonuçlandırılacaktır."
      }
    ]
  },
  cookies: {
    title: "Çerez (Cookie) Politikası",
    sections: [
      {
        body: "Bu politika, Steply platformunun çerez kullanımını ve çerezler aracılığıyla gerçekleştirilen veri işleme faaliyetlerini açıklamaktadır."
      },
      {
        heading: "Çerez Nedir?",
        body: "Çerezler, web tarayıcınız tarafından cihazınıza yerleştirilen küçük metin dosyalarıdır. Platformumuzun işlevselliği, kişiselleştirme ve güvenlik amaçlarıyla kullanılmaktadır."
      },
      {
        heading: "Kullandığımız Çerez Türleri",
        body: "Zorunlu Çerezler: Kimlik doğrulama oturumu ve güvenlik tokenları (oturum süresi boyunca). Tercih Çerezleri: Tema, dil ve arayüz tercihleri (1 yıl). Analitik Çerezler: Anonimleştirilmiş kullanım istatistikleri (6 ay). Platform, üçüncü taraf reklam veya izleme çerezi kullanmamaktadır."
      },
      {
        heading: "Çerezlerin Yönetimi",
        body: "Tarayıcınızın ayarlar menüsünden çerezleri engelleyebilir veya silebilirsiniz. Zorunlu çerezlerin engellenmesi, oturum açma işlevinin çalışmamasına yol açabilir. Çerez yönetimine ilişkin sorularınız için: cookies@must-b.com"
      }
    ]
  },
  contact: {
    title: "İletişim ve Haklar",
    sections: [
      {
        heading: "MUST-B Teknoloji A.Ş.",
        body: "Türkiye merkezli bir eğitim teknolojisi girişimidir. Steply platformu, MUST-B bünyesinde geliştirilmekte ve işletilmektedir."
      },
      {
        heading: "İletişim Kanalları",
        body: "Genel İletişim: info@must-b.com | Kurumsal Web: https://must-b.com | Teknik Destek: support@must-b.com | Hukuki Bildirimler: legal@must-b.com | KVKK Başvuruları: kvkk@must-b.com | İçerik Kaldırma Talepleri: abuse@must-b.com | DMCA / Telif Hakkı: dmca@must-b.com"
      },
      {
        heading: "Yanıt Süreleri",
        body: "Genel talepler: En fazla 3 iş günü. KVKK başvuruları: En fazla 30 gün (yasal yükümlülük). Acil güvenlik bildirimleri: 24 saat içinde ilk yanıt."
      },
      {
        heading: "Şikayet ve İtiraz",
        body: "Kişisel veri işleme faaliyetlerimize itiraz etmek istemeniz hâlinde Kişisel Verileri Koruma Kurumu'na (KVKK) başvurma hakkınız saklıdır: www.kvkk.gov.tr"
      }
    ]
  }
};

interface LegalModalProps {
  slug: LegalSlug;
  onClose: () => void;
}

export default function LegalModal({ slug, onClose }: LegalModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { title, sections } = LEGAL[slug];

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
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl"
        style={{
          background: "linear-gradient(160deg, rgba(20,22,30,0.99) 0%, rgba(15,17,24,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 border-b sticky top-0 z-10"
          style={{
            borderColor: "rgba(255,255,255,0.07)",
            background: "linear-gradient(160deg, rgba(20,22,30,0.99) 0%, rgba(15,17,24,0.99) 100%)",
          }}
        >
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Steply / MUST-B Teknoloji A.Ş.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-7 py-6 flex flex-col gap-6">
          {sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "#A020F0" }}
                  />
                  {section.heading}
                </h3>
              )}
              <p className="text-sm text-slate-400 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Footer bar */}
        <div
          className="px-7 py-4 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="text-xs text-slate-600">Son güncelleme: Ağustos 2025</span>
          <a
            href="https://must-b.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold transition-opacity hover:opacity-80"
            style={{
              background: "linear-gradient(135deg, #A020F0 0%, #FF7F50 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MUST-B
          </a>
        </div>
      </div>
    </div>
  );
}
