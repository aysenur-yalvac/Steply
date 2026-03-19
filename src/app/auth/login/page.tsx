import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;
  const error = resolvedSearchParams?.error;
  
  const displayMessage = error === 'invalid_token' 
    ? "Verification link is invalid or has expired. Please try again." 
    : message;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 w-full max-w-md mx-auto relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-8 group transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
        Go Back
      </Link>
      
      <div className="flex flex-col items-center mb-8 mt-12">
        <Link href="/" className="flex items-center gap-2 text-slate-800 hover:opacity-80 transition-opacity mb-6">
          <BookOpen className="w-8 h-8 text-indigo-500" />
          <span className="font-bold text-3xl tracking-tight">Steply</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-center">Log in to your account to continue managing your projects.</p>
      </div>

      <div className="w-full bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-slate-200 shadow-xl">
        <form action="/api/auth/login" method="post" className="flex-1 flex flex-col w-full gap-4 text-slate-700">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email Address
            </label>
            <input
              className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              name="email"
              placeholder="example@student.edu.tr"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg mt-4"
          >
            Log In
          </button>

          {displayMessage && (
            <div className="mt-4 p-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg text-center">
              {displayMessage}
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
