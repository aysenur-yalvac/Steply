import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center max-w-lg">
        <div className="flex items-center gap-2 mb-8 animate-bounce">
          <BookOpen className="w-12 h-12 text-indigo-500" />
          <span className="font-bold text-4xl tracking-tight text-slate-900 dark:text-white">Steply</span>
        </div>
        
        <h1 className="text-8xl font-black text-indigo-500/20 mb-4 select-none">404</h1>
        
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          The Step You're Looking For Does Not Exist
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">
          It seems you have strayed off course. Don't worry, you have a safe way back to your projects.
        </p>
        
        <Link 
          href="/" 
          className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] active:scale-95"
        >
          <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          Go to Home
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
