import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center text-center px-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
          <BookOpen className="w-4 h-4" />
          <span>Eğitim İçin Yeniden Tasarlandı</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6">
          Proje Yönetimini <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Kolaylaştırın</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Öğrenciler ve öğretmenler için özel olarak geliştirilmiş Steply ile projelerinizi takip edin, GitHub bağlantılarınızı paylaşın ve ilerlemenizi tek bir yerden yönetin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/auth/register" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_-5px_var(--color-indigo-500)]">
            Hemen Başla
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/auth/login" className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-4 rounded-xl transition-colors border border-slate-700 hover:border-slate-600">
            Giriş Yap
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <Users className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Rol Tabanlı Sistem</h3>
          <p className="text-slate-400">
            Öğrenci veya öğretmen olarak kayıt olun. Her role özel farklı deneyim ve araçlarla verimliliğinizi artırın.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
            <Layers className="w-7 h-7 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">İlerleme Takibi</h3>
          <p className="text-slate-400">
            Projelerinizin ilerleme yüzdesini güncelleyin. Öğretmenler projelerin durumunu canlı olarak görebilir.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">GitHub Entegrasyonu</h3>
          <p className="text-slate-400">
            Kodlarınızı tek tıkla entegre edin. Proje repo linklerinizi kolayca paylaşarak ekip çalışmasını güçlendirin.
          </p>
        </div>
      </section>
    </div>
  );
}
