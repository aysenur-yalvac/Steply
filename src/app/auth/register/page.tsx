import Link from "next/link";
import { signup } from "../actions";
import { BookOpen } from "lucide-react";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
         <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-6">
          <BookOpen className="w-8 h-8 text-indigo-500" />
          <span className="font-bold text-3xl tracking-tight">Steply</span>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Topluluğa Katılın</h1>
        <p className="text-slate-400 text-center">Öğrenci veya öğretmen olarak kaydınızı tamamlayın ve hemen başlayın.</p>
      </div>

      <div className="w-full bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-xl">
        <form action="/api/auth/register" method="post" className="flex-1 flex flex-col w-full gap-4 text-slate-300">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="fullName">
              Ad Soyad
            </label>
            <input
              className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              name="fullName"
              placeholder="Ali Yılmaz"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              name="email"
              type="email"
              placeholder="ornek@ogrenci.edu.tr"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Şifre
            </label>
            <input
              className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              type="password"
              name="password"
              placeholder="En az 6 karakter"
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="role">
              Rolünüz
            </label>
            <div className="relative">
              <select
                name="role"
                defaultValue="student"
                className="w-full appearance-none px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors cursor-pointer"
                required
              >
                <option value="student">Öğrenci</option>
                <option value="teacher">Öğretmen</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)] mt-4"
          >
            Kayıt Ol
          </button>

          {message && (
            <div className="mt-4 p-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg text-center">
              {message}
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
