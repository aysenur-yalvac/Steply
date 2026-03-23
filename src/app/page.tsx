import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Users } from "lucide-react";
import CanvasParticles from "@/components/ui/CanvasParticles";

export default function Home() {
  return (
    <div
      className="flex flex-col items-center w-full min-h-screen relative overflow-hidden"
      style={{ background: "#0B0E14" }}
    >
      <CanvasParticles />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-36 flex flex-col items-center text-center px-6 relative z-10">
        {/* Aura glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none -z-10"
          style={{ background: "radial-gradient(ellipse, rgba(160,32,240,0.18) 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,255,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
          style={{ background: "radial-gradient(ellipse, rgba(255,127,80,0.08) 0%, transparent 70%)" }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
          style={{
            background: "rgba(160,32,240,0.10)",
            border: "1px solid rgba(160,32,240,0.25)",
            color: "#C97EFF",
          }}>
          <BookOpen className="w-4 h-4" />
          <span>Redesigned for Education</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6 leading-tight">
          The Ultimate{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #A020F0 0%, #FF7F50 100%)" }}
          >
            Project &amp; Mentorship Hub
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium">
          More than just a tracking tool. Steply is where students and mentors{" "}
          <strong className="text-slate-200">collaborate, build, and scale</strong> their portfolio together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/auth/register"
            className="btn-aura flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-slate-200 font-semibold px-8 py-4 rounded-xl transition-all hover:bg-white/5 active:scale-95"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Log In
          </Link>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div
          className="flex flex-col items-center text-center p-8 rounded-3xl backdrop-blur-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group"
          style={{
            background: "rgba(160,32,240,0.07)",
            border: "1px solid rgba(160,32,240,0.18)",
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(160,32,240,0.18) 0%, transparent 70%)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "rgba(160,32,240,0.12)", border: "1px solid rgba(160,32,240,0.22)" }}>
            <Users className="w-7 h-7" style={{ color: "#C97EFF" }} />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3">Role-Based Mentorship</h3>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
            Increase your productivity with different experiences and tools tailored for distinct roles.
          </p>
        </div>

        {/* Card 2 */}
        <div
          className="flex flex-col items-center text-center p-8 rounded-3xl backdrop-blur-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group"
          style={{
            background: "rgba(124,58,255,0.07)",
            border: "1px solid rgba(124,58,255,0.18)",
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,255,0.18) 0%, transparent 70%)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "rgba(124,58,255,0.12)", border: "1px solid rgba(124,58,255,0.22)" }}>
            <Layers className="w-7 h-7" style={{ color: "#A78BFA" }} />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3">Real-time Progress Tracking</h3>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
            Update the progress percentage of your projects natively. Mentors can see the status of projects live.
          </p>
        </div>

        {/* Card 3 */}
        <div
          className="flex flex-col items-center text-center p-8 rounded-3xl backdrop-blur-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group"
          style={{
            background: "rgba(255,127,80,0.06)",
            border: "1px solid rgba(255,127,80,0.16)",
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,127,80,0.15) 0%, transparent 70%)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "rgba(255,127,80,0.10)", border: "1px solid rgba(255,127,80,0.20)" }}>
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#FFA880"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3">GitHub Integration</h3>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
            Integrate your code with one click. Strengthen teamwork by easily sharing your project repo links.
          </p>
        </div>
      </section>
    </div>
  );
}
