"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type LegalSlug = "privacy" | "terms" | "kvkk" | "cookies" | "contact";

const LEGAL: Record<LegalSlug, { title: string; sections: { heading?: string; body: string }[] }> = {
  privacy: {
    title: "Gizlilik Politikası",
    sections: [
      {
        body: "Bu Gizlilik Politikası, MUST-B Teknoloji A.Ş. tarafından işletilen Must-b Academy platformunun kullanıcı verilerini nasıl topladığını, işlediğini, sakladığını ve koruduğunu açıklamaktadır. Platformumuzu kullanarak bu politikayı kabul etmiş sayılırsınız."
      },
      {
        heading: "1. Toplanan Kişisel Veriler",
        body: "Ad soyad, e-posta adresi, şifrelenmiş parola özeti (hash), seçilen kullanıcı rolü (öğrenci / öğretmen), kurum/üniversite adı, sınıf bilgisi, okul numarası, kurumsal okul e-postası, telefon numarası, şehir/ülke, şirket/kurum bilgisi, biyografi, profil fotoğrafı, sosyal medya bağlantıları (GitHub, LinkedIn, X/Twitter, kişisel web sitesi), öğretmen hesapları için görev/doğrulama belgesi ve kurum/MEBBİS kodu; ayrıca platform içi proje, ödev, yüklenen dosyalar, tartışma notları, değerlendirmeler, mesaj içerikleri ile IP adresi ve oturum güvenliği kayıtları."
      },
      {
        heading: "2. Verilerin İşlenme Amaçları ve Saklama Süresi",
        body: "Kişisel verileriniz; hesap oluşturma, kimlik ve kurumsal rol doğrulama, akademik proje/ödev ve sınıf yönetimi, ekip içi mesajlaşma ve bildirim süreçlerinin yürütülmesi, teknik destek sağlanması ve 6698 sayılı KVKK ile 5651 sayılı Kanun'dan doğan yükümlülüklerin yerine getirilmesi amacıyla işlenir. Verileriniz hesabınız aktif olduğu sürece saklanır; hesabın silinmesi veya yasal başvuru hâlinde, mevzuatın zorunlu kıldığı yasal saklama süreleri dışındaki tüm veriler silinir, yok edilir veya anonimleştirilir."
      },
      {
        heading: "3. Yurt Dışı Veri Aktarımı (KVKK m.9)",
        body: "Hizmetin teknik olarak sunulabilmesi amacıyla; veritabanı, kimlik doğrulama ve dosya depolama için Supabase, web uygulaması barındırma için Vercel ve yalnızca hesap güvenliği/doğrulama kodu (OTP) gibi işlemsel e-postaların iletilmesi için Resend altyapıları kullanılmaktadır. Bu aktarımlar, 6698 sayılı KVKK'nın 9. maddesi kapsamındaki uygun güvenceler ve açık rızanız doğrultusunda gerçekleştirilir. Ticari veya reklam amacıyla hiçbir üçüncü tarafla veri paylaşılmaz."
      },
      {
        heading: "4. Veri Güvenliği",
        body: "Tüm veritabanı tabloları PostgreSQL Row Level Security (RLS) politikaları ile korunmaktadır. Kullanıcı oturumları TLS 1.3 protokolü ile şifrelenmekte, parolalar tek yönlü bcrypt algoritması ile hashlenerek saklanmaktadır."
      },
      {
        heading: "5. İletişim",
        body: "Gizlilik politikamıza ilişkin sorularınız ve talepleriniz için: kvkk@must-b.com | iletisim@must-b.com"
      }
    ]
  },
  terms: {
    title: "Kullanım Koşulları",
    sections: [
      {
        body: "Bu Kullanım Koşulları, MUST-B Teknoloji A.Ş. tarafından sunulan Must-b Academy platformunu kullanmanıza ilişkin yasal çerçeveyi belirlemektedir. Platforma kayıt olarak veya erişim sağlayarak bu koşulları kabul etmiş sayılırsınız."
      },
      {
        heading: "1. Hizmetin Tanımı",
        body: "Must-b Academy, öğrencilerin projelerini ve görevlerini yönetmesine, öğretmenlerin sınıf ve ödev oluşturmasına ve akademik iş birliği süreçlerinin dijital ortamda takip edilmesine olanak tanıyan ücretsiz bir eğitim yönetim platformudur."
      },
      {
        heading: "2. Hesap Sorumluluğu",
        body: "Kullanıcı, hesabının güvenliğinden ve hesabı aracılığıyla gerçekleştirilen tüm işlemlerden münferiden sorumludur. Şüpheli bir erişim tespit edilmesi hâlinde derhal iletisim@must-b.com adresine bildirim yapılması zorunludur."
      },
      {
        heading: "3. Yasaklanan Kullanımlar",
        body: "Başkalarına ait fikrî mülkiyet ve telif haklarının (5846 sayılı FSEK) ihlali; spam, kötü amaçlı yazılım veya yanıltıcı içerik yayımı; diğer kullanıcılara yönelik taciz, tehdit veya ayrımcı davranışlar; platformun teknik altyapısına zarar verebilecek faaliyetler kesinlikle yasaktır."
      },
      {
        heading: "4. İçerik Sorumluluğu ve Uyar-Kaldır İlkesi (5651 & 5846 Sayılı Kanunlar)",
        body: "Platforma yüklenen proje, dosya, yorum ve mesaj içeriklerinden münhasıran içeriği yükleyen kullanıcı sorumludur. MUST-B Teknoloji A.Ş., 5651 sayılı Kanun kapsamında yer sağlayıcı konumundadır; proje ve profil sayfalarındaki 'İçeriği Bildir' butonu veya abuse@must-b.com adresi üzerinden iletilen hak ve hukuka aykırılık bildirimleri incelenerek ihlal tespit edilen içerikler yayından kaldırılır."
      },
      {
        heading: "5. Hesap Sonlandırma",
        body: "Bu Kullanım Koşullarını ihlal eden hesaplar, bildirim üzerine askıya alınabilir veya kalıcı olarak sonlandırılabilir."
      },
      {
        heading: "6. İletişim",
        body: "Hukuki bildirimler, telif ve içerik şikayetleri için: abuse@must-b.com | iletisim@must-b.com"
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
        heading: "1. Veri Sorumlusu ve Yer Sağlayıcı",
        body: "MUST-B Teknoloji A.Ş. — Türkiye | E-posta: kvkk@must-b.com | iletisim@must-b.com"
      },
      {
        heading: "2. İşlenen Kişisel Veriler",
        body: "Kimlik ve İletişim Verileri: Ad soyad, e-posta adresi, kurumsal okul e-postası, telefon numarası, şehir ve ülke bilgisi. Akademik ve Mesleki Veriler: Kullanıcı rolü (öğrenci / öğretmen), kurum/üniversite adı, sınıf bilgisi, okul numarası, şirket/kurum adı, öğretmen doğrulama belgesi ve kurum/MEBBİS kodu. Profil ve İçerik Verileri: Şifre özeti (hash), profil fotoğrafı, biyografi, sosyal medya bağlantıları (GitHub, LinkedIn, X/Twitter, web sitesi), platform içi oluşturulan projeler, yüklenen dosyalar, görevler, tartışma notları, değerlendirmeler ve kullanıcılar arası mesajlar. İşlem Güvenliği Verileri: IP adresi, oturum ve aktivite kayıtları."
      },
      {
        heading: "3. İşlenme Amaçları ve Hukuki Dayanaklar",
        body: "KVKK Madde 5/2-c (sözleşmenin kurulması ve ifası): Üyelik kaydı, kimlik doğrulama, proje/sınıf/ödev yönetimi ve ekip içi iletişim hizmetlerinin sunulması. KVKK Madde 5/2-ç (hukuki yükümlülük): 5651 sayılı Kanun ve ilgili mevzuat kapsamındaki yer sağlayıcı ve bilgi güvenliği yükümlülüklerinin yerine getirilmesi. KVKK Madde 5/2-f (meşru menfaat): Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi."
      },
      {
        heading: "4. Yurt Dışı Aktarım (KVKK Madde 9)",
        body: "Kişisel verileriniz; bulut veritabanı ve dosya depolama hizmeti için Supabase, web uygulama sunucusu hizmeti için Vercel ve yalnızca hesap doğrulama (OTP) ile şifre sıfırlama gibi işlemsel e-postaların gönderimi için Resend altyapılarına, KVKK Madde 9 kapsamındaki güvenceler ve açık rızanız doğrultusunda aktarılmaktadır."
      },
      {
        heading: "5. Saklama Süreleri",
        body: "Kişisel verileriniz, platform üzerindeki hesabınız aktif olduğu sürece işlenir ve saklanır. Hesabınızı silmeniz veya verilerinizin silinmesini talep etmeniz hâlinde, ilgili mevzuatın öngördüğü yasal saklama süreleri saklı kalmak kaydıyla kişisel verileriniz silinir, yok edilir veya anonim hale getirilir."
      },
      {
        heading: "6. Veri Sahibinin Hakları (KVKK Madde 11) ve Başvuru",
        body: "KVKK'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, amacına uygun kullanılıp kullanılmadığını ve aktarıldığı üçüncü kişileri öğrenme, düzeltilmesini veya silinmesini/yok edilmesini isteme haklarına sahipsiniz. Başvurularınızı kvkk@must-b.com veya iletisim@must-b.com adresine iletebilirsiniz; başvurular en geç 30 gün içinde ücretsiz olarak sonuçlandırılır."
      }
    ]
  },
  cookies: {
    title: "Çerez (Cookie) Politikası",
    sections: [
      {
        body: "Bu politika, Must-b Academy platformunun çerez ve yerel depolama kullanımını açıklamaktadır."
      },
      {
        heading: "1. Çerez Nedir?",
        body: "Çerezler, web tarayıcınız tarafından cihazınıza yerleştirilen küçük veri dosyalarıdır. Platformumuzda yalnızca hizmetin güvenli çalışması ve kullanıcı tercihlerinizin hatırlanması amacıyla kullanılmaktadır."
      },
      {
        heading: "2. Kullandığımız Çerez Türleri",
        body: "Zorunlu Oturum ve Güvenlik Çerezleri: Supabase kimlik doğrulama oturumunun sürdürülmesi ve yetkisiz erişimlerin engellenmesi için zorunludur (oturum süresi boyunca). İşlevsel Tercih Kayıtları: Aydınlık/karanlık tema tercihi ve arayüz görünüm ayarlarını hatırlar. Platformumuzda üçüncü taraf reklam, pazarlama, profilleme veya harici analitik izleme çerezi KULLANILMAMAKTADIR."
      },
      {
        heading: "3. Çerezlerin Yönetimi",
        body: "Tarayıcınızın ayarlar menüsünden çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz. Ancak zorunlu oturum çerezlerinin devre dışı bırakılması durumunda platforma giriş yapılması mümkün olmayabilir. Sorularınız için: kvkk@must-b.com"
      }
    ]
  },
  contact: {
    title: "İletişim ve Künye",
    sections: [
      {
        heading: "Veri Sorumlusu ve Yer Sağlayıcı",
        body: "MUST-B Teknoloji A.Ş. — Türkiye. Must-b Academy platformu, MUST-B Teknoloji A.Ş. bünyesinde geliştirilmekte ve işletilmektedir."
      },
      {
        heading: "Resmî İletişim ve Bildirim Kanalları",
        body: "Genel İletişim ve Destek: iletisim@must-b.com | KVKK ve Veri Sahibi Başvuruları: kvkk@must-b.com | Telif Hakkı (5846 FSEK) ve İçerik İhlal Bildirimleri (5651): abuse@must-b.com | Kurumsal Web: https://must-b.com"
      },
      {
        heading: "Yanıt ve İnceleme Süreleri",
        body: "İçerik ve telif ihlali bildirimleri: 24-48 saat içinde incelenir. Genel destek talepleri: En fazla 3 iş günü. KVKK başvuruları: En geç 30 gün (6698 sayılı Kanun m.13 uyarınca)."
      },
      {
        heading: "Şikayet ve İtiraz",
        body: "Platform üzerindeki herhangi bir proje veya profil içeriğini sayfa içerisindeki 'İçeriği Bildir' butonuyla doğrudan yönetici incelemesine gönderebilir veya abuse@must-b.com adresine iletebilirsiniz. Kişisel veri işleme faaliyetlerine ilişkin Kişisel Verileri Koruma Kurumu'na (www.kvkk.gov.tr) başvurma hakkınız saklıdır."
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
            <p className="text-xs text-slate-500 mt-0.5">Must-b Academy / MUST-B Teknoloji A.Ş.</p>
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
          <span className="text-xs text-slate-600">Son güncelleme: Kasım 2026</span>
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

