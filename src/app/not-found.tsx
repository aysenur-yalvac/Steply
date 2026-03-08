import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="text-[120px] font-black text-slate-900 leading-none select-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
             <Compass className="w-20 h-20 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-white mb-4">Sayfa Bulunamadı</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak ulaşılamıyor olabilir.
        </p>
        
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)]"
        >
          <Home className="w-5 h-5" /> Kontrol Paneline Dön
        </Link>
      </div>
    </div>
  );
}
