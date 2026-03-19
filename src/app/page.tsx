import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Users } from "lucide-react";
import MouseGlow from "@/components/ui/MouseGlow";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full bg-slate-50 min-h-screen relative">
      <MouseGlow />
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center text-center px-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
          <BookOpen className="w-4 h-4" />
          <span>Redesigned for Education</span>
        </div>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl rounded-full scale-110 pointer-events-none" />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-[0_10px_25px_rgba(99,102,241,0.6)]">Engineering Hub</span>
          </h1>
        </div>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
          More than just a tracking tool. Steply is the ultimate <strong>Engineering Hub</strong> for students and mentors to collaborate, build, and scale their portfolio together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/auth/register" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_-5px_var(--color-indigo-500)]">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/auth/login" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-extrabold px-8 py-4 rounded-xl transition-all border border-slate-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
            Log In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 backdrop-blur-xl border border-indigo-400/40 shadow-xl hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.6)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-400/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <Users className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Role-Based Mentorship</h3>
          <p className="text-slate-500 font-medium">
            Increase your productivity with different experiences and tools tailored for distinct roles.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-xl border border-purple-400/40 shadow-xl hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.6)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-400/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
            <Layers className="w-7 h-7 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Real-time Progress Tracking</h3>
          <p className="text-slate-500 font-medium">
            Update the progress percentage of your projects natively. Mentors can see the status of projects live.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl border border-blue-400/40 shadow-xl hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.6)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
          <h3 className="text-xl font-bold text-slate-800 mb-3">GitHub Integration</h3>
          <p className="text-slate-500 font-medium">
            Integrate your code with one click. Strengthen teamwork by easily sharing your project repo links.
          </p>
        </div>
      </section>
    </div>
  );
}
