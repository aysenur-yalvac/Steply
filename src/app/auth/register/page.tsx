import RegisterCard from "./RegisterCard";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolved = await searchParams;
  const displayMessage = resolved?.message;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* ── Ambient mesh glows ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-0 right-0 w-[700px] h-[600px]"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(160,32,240,0.16) 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(124,58,255,0.12) 0%, transparent 60%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px]"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(160,32,240,0.04) 0%, transparent 65%)" }}
        />
        {/* Coral accent — top left */}
        <div
          className="absolute top-0 left-0 w-[400px] h-[350px]"
          style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,127,80,0.07) 0%, transparent 55%)" }}
        />
      </div>

      {/* Card container */}
      <div className="w-full max-w-md">
        <RegisterCard message={displayMessage} />
      </div>
    </div>
  );
}
