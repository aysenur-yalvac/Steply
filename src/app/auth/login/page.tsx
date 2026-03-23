import LoginCard from "./LoginCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const resolved = await searchParams;
  const displayMessage =
    resolved?.error === "invalid_token"
      ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin."
      : resolved?.message;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* ── Ambient mesh glows ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-0 left-0 w-[700px] h-[600px]"
          style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(160,32,240,0.18) 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(124,58,255,0.13) 0%, transparent 60%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px]"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(160,32,240,0.05) 0%, transparent 65%)" }}
        />
        {/* Coral accent — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[350px]"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(255,127,80,0.08) 0%, transparent 55%)" }}
        />
      </div>

      {/* Card container */}
      <div className="w-full max-w-md">
        <LoginCard message={displayMessage} />
      </div>
    </div>
  );
}
