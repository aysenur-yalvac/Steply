import Link from "next/link";
import { login } from "./actions";
import { BookOpen } from "lucide-react";

export default async function LoginPage({
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
        <h1 className="text-2xl font-bold text-white mb-2">Hoş Geldiniz</h1>
        <p className="text-slate-400 text-center">Hesabınıza giriş yaparak projelerinizi yönetmeye devam edin.</p>
      </div>

      <div className="w-full bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-xl">
        <form className="flex-1 flex flex-col w-full gap-4 text-slate-300">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              name="email"
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
              placeholder="••••••••"
              required
            />
          </div>

          <button
            formAction={login}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)] mt-4"
          >
            Giriş Yap
          </button>

          {message && (
            <div className="mt-4 p-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg text-center">
              {message}
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Hesabınız yok mu?{' '}
          <Link href="/auth/register" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
